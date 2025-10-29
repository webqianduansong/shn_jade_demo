import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    console.log('[API] 清空购物车');
    
    // 检查用户是否登录
    const user = await getAuthUser();
    
    if (user?.id) {
      // 登录用户：清空数据库
      console.log('[API] 登录用户，清空数据库购物车:', user.id);
      
      const cart = await prisma.cart.findFirst({
        where: { userId: user.id }
      });
      
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
      }
      
      console.log('[API] 数据库购物车已清空');
      
    } else {
      // 未登录用户：清空 Cookie
      console.log('[API] 未登录用户，清空 Cookie 购物车');
      
      const response = NextResponse.json({
        success: true,
        message: '购物车已清空'
      });
      
      // 清空 Cookie
      response.cookies.set('cart', '[]', {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
      });
      
      return response;
    }
    
    return NextResponse.json({ success: true, message: '购物车已清空' });
    
  } catch (error) {
    console.error('[API] 清空购物车失败:', error);
    return NextResponse.json(
      { success: false, message: '清空购物车失败' },
      { status: 500 }
    );
  }
}

