import { NextRequest, NextResponse } from 'next/server';
import { removeFromCart } from '@/store/cartActions';

export const dynamic = 'force-dynamic';

/**
 * 从购物车移除商品API端点
 */
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    
    // 使用重构后的removeFromCart函数
    const result = await removeFromCart(productId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json({
      success: false,
      error: '从购物车移除失败，请重试'
    }, { status: 500 });
  }
}
