import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * 添加商品到购物车API端点
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();
    
    if (!productId) {
      return NextResponse.json({
        success: false,
        error: '商品ID不能为空'
      }, { status: 400 });
    }
    
    if (!quantity || quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: '商品数量必须大于0'
      }, { status: 400 });
    }
    
    console.log('[添加购物车] productId:', productId, 'quantity:', quantity);
    
    // 检查用户是否登录
    const user = await getAuthUser();
    
    if (user?.id) {
      // 登录用户：保存到数据库
      console.log('[添加购物车] 登录用户，保存到数据库:', user.id);
      
      const cart = await prisma.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
      
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId }
      });
      
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity }
        });
      }
      
      const items = await prisma.cartItem.findMany({
        where: { cartId: cart.id }
      });
      
      console.log('[添加购物车] 数据库更新成功，总商品数:', items.length);
      
      return NextResponse.json({
        success: true,
        message: '已添加到购物车',
        data: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      });
      
    } else {
      // 未登录用户：保存到 Cookie
      console.log('[添加购物车] 未登录用户，保存到 Cookie');
      
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get('cart');
      let cart: CartItem[] = [];
      
      if (cartCookie) {
        try {
          cart = JSON.parse(cartCookie.value);
        } catch (e) {
          console.error('[添加购物车] Cookie 解析失败:', e);
          cart = [];
        }
      }
      
      const existing = cart.find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ productId, quantity });
      }
      
      console.log('[添加购物车] Cookie 更新后的购物车:', cart);
      
      const response = NextResponse.json({
        success: true,
        message: '已添加到购物车',
        data: cart
      });
      
      // 设置 Cookie
      response.cookies.set('cart', JSON.stringify(cart), {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30天
        secure: process.env.NODE_ENV === 'production',
      });
      
      return response;
    }
    
  } catch (error) {
    console.error('[添加购物车] 错误:', error);
    return NextResponse.json({
      success: false,
      error: '添加到购物车失败，请重试'
    }, { status: 500 });
  }
}
