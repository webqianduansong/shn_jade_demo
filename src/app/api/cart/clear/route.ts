import { NextResponse } from 'next/server';
import { clearCart } from '@/store/cartActions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    console.log('[API] 清空购物车');
    await clearCart();
    console.log('[API] 购物车已清空');
    return NextResponse.json({ success: true, message: '购物车已清空' });
  } catch (error) {
    console.error('[API] 清空购物车失败:', error);
    return NextResponse.json(
      { success: false, message: '清空购物车失败' },
      { status: 500 }
    );
  }
}

