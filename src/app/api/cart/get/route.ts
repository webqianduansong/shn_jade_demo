import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CartItem {
  productId: string;
  quantity: number;
}

export async function GET() {
  try {
    console.log('[API] 获取购物车数据');
    
    // 检查用户是否登录
    const user = await getAuthUser();
    
    if (user?.id) {
      // 登录用户：从数据库获取
      console.log('[API] 登录用户，从数据库获取:', user.id);
      
      const cart = await prisma.cart.findFirst({
        where: { userId: user.id },
        include: { items: true },
      });
      
      if (!cart) {
        console.log('[API] 数据库中没有购物车');
        return NextResponse.json({ success: true, data: [] });
      }
      
      const items = cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity
      }));
      
      console.log('[API] 数据库购物车商品数量:', items.length);
      return NextResponse.json({ success: true, data: items });
      
    } else {
      // 未登录用户：从 Cookie 获取
      console.log('[API] 未登录用户，从 Cookie 获取');
      
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get('cart');
      
      if (!cartCookie) {
        console.log('[API] Cookie 中没有购物车');
        return NextResponse.json({ success: true, data: [] });
      }
      
      let cart: CartItem[] = [];
      try {
        cart = JSON.parse(cartCookie.value);
        console.log('[API] Cookie 购物车商品数量:', cart.length);
      } catch (e) {
        console.error('[API] Cookie 解析失败:', e);
        cart = [];
      }
      
      return NextResponse.json({ success: true, data: cart });
    }
    
  } catch (error) {
    console.error('[API] 获取购物车失败:', error);
    return NextResponse.json(
      { success: false, message: '获取购物车失败' },
      { status: 500 }
    );
  }
}

