import { NextResponse } from 'next/server';
import { getCart } from '@/store/cartActions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[API] 获取购物车数据');
    const cart = await getCart();
    console.log('[API] 购物车商品数量:', cart.length);
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error('[API] 获取购物车失败:', error);
    return NextResponse.json(
      { success: false, message: '获取购物车失败' },
      { status: 500 }
    );
  }
}

