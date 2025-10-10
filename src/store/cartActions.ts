"use server";
import {cookies} from 'next/headers';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

/**
 * 购物车项类型定义
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * 购物车操作结果类型
 */
export interface CartActionResult {
  success: boolean;
  message?: string;
  data?: CartItem[];
}

/**
 * Cookie选项常量
 */
const COOKIE_OPTIONS = {
  httpOnly: false, 
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 // 30天过期
};

async function getAuthUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id ?? null;
}

async function getDbCartItems(userId: string): Promise<CartItem[]> {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true },
  });
  if (!cart) return [];
  return cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
}

async function upsertDbCartAndItem(userId: string, productId: string, quantityDelta: number): Promise<CartItem[]> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantityDelta },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: quantityDelta } });
  }
  return getDbCartItems(userId);
}

async function setDbCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
  if (!existing) {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  } else {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
  }
  return getDbCartItems(userId);
}

async function removeDbCartItem(userId: string, productId: string): Promise<CartItem[]> {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) return [];
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  return getDbCartItems(userId);
}

async function clearDbCart(userId: string): Promise<CartItem[]> {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) return [];
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return [];
}

/**
 * 获取购物车数据
 * @returns 购物车内容数组
 */
export async function getCart(): Promise<CartItem[]> {
  try {
    const userId = await getAuthUserId();
    if (userId) {
      // 登录用户走数据库
      return await getDbCartItems(userId);
    }
    const store = await cookies();
    const raw = store.get('cart');
    if (!raw) return [];
    const parsedCart = JSON.parse(raw.value) as CartItem[];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error('读取购物车失败:', error);
    return [];
  }
}

/**
 * 添加商品到购物车
 * @param productId 商品ID
 * @param quantity 数量
 * @returns 操作结果
 */
export async function addToCart(productId: string, quantity: number): Promise<CartActionResult> {
  try {
    if (!productId) {
      return { success: false, message: '商品ID不能为空' };
    }
    
    if (!quantity || quantity <= 0) {
      return { success: false, message: '商品数量必须大于0' };
    }
    
    const userId = await getAuthUserId();
    if (userId) {
      const data = await upsertDbCartAndItem(userId, productId, quantity);
      return { success: true, message: '已添加到购物车', data };
    } else {
      const cart = await getCart();
      const existing = cart.find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ productId, quantity });
      }
      const store = await cookies();
      store.set('cart', JSON.stringify(cart), COOKIE_OPTIONS);
      return { success: true, message: '已添加到购物车', data: cart };
    }
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return { 
      success: false, 
      message: '添加到购物车失败，请重试' 
    };
  }
}

/**
 * 更新购物车商品数量
 * @param productId 商品ID
 * @param quantity 新数量
 * @returns 操作结果
 */
export async function updateCartItem(productId: string, quantity: number): Promise<CartActionResult> {
  try {
    if (!productId) {
      return { success: false, message: '商品ID不能为空' };
    }
    
    if (!quantity || quantity <= 0) {
      return { success: false, message: '商品数量必须大于0' };
    }
    
    const userId = await getAuthUserId();
    if (userId) {
      const data = await setDbCartItemQuantity(userId, productId, quantity);
      return { success: true, message: '购物车已更新', data };
    } else {
      const cart = await getCart();
      const itemIndex = cart.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        return { success: false, message: '商品不在购物车中' };
      }
      cart[itemIndex].quantity = quantity;
      const store = await cookies();
      store.set('cart', JSON.stringify(cart), COOKIE_OPTIONS);
      return { success: true, message: '购物车已更新', data: cart };
    }
  } catch (error) {
    console.error('更新购物车失败:', error);
    return { 
      success: false, 
      message: '更新购物车失败，请重试' 
    };
  }
}

/**
 * 从购物车移除商品
 * @param productId 商品ID
 * @returns 操作结果
 */
export async function removeFromCart(productId: string): Promise<CartActionResult> {
  try {
    if (!productId) {
      return { success: false, message: '商品ID不能为空' };
    }
    
    const userId = await getAuthUserId();
    if (userId) {
      const data = await removeDbCartItem(userId, productId);
      return { success: true, message: '商品已从购物车移除', data };
    } else {
      const cart = await getCart();
      const updatedCart = cart.filter(item => item.productId !== productId);
      const store = await cookies();
      store.set('cart', JSON.stringify(updatedCart), COOKIE_OPTIONS);
      return { success: true, message: '商品已从购物车移除', data: updatedCart };
    }
  } catch (error) {
    console.error('从购物车移除失败:', error);
    return { 
      success: false, 
      message: '从购物车移除失败，请重试' 
    };
  }
}

/**
 * 清空购物车
 * @returns 操作结果
 */
export async function clearCart(): Promise<CartActionResult> {
  try {
    const userId = await getAuthUserId();
    if (userId) {
      await clearDbCart(userId);
      return { success: true, message: '购物车已清空', data: [] };
    } else {
      const store = await cookies();
      store.set('cart', JSON.stringify([]), COOKIE_OPTIONS);
      return { success: true, message: '购物车已清空', data: [] };
    }
  } catch (error) {
    console.error('清空购物车失败:', error);
    return { 
      success: false, 
      message: '清空购物车失败，请重试' 
    };
  }
}

