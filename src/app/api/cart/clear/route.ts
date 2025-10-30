import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 清空购物车
 * POST /api/cart/clear
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    // 查找用户的购物车
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true }
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: '购物车已为空'
      });
    }

    // 删除购物车中的所有商品
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    console.log(`[Clear Cart] 已清空用户 ${user.email} 的购物车`);

    return NextResponse.json({
      success: true,
      message: '购物车已清空'
    });
  } catch (error) {
    console.error('[Clear Cart] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '清空购物车失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
