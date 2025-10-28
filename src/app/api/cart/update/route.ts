import { NextRequest, NextResponse } from 'next/server';
import { updateCartItem, removeFromCart } from '@/store/cartActions';

export const dynamic = 'force-dynamic';

/**
 * 更新购物车商品数量API端点
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();
    
    // 如果数量为0或负数，移除商品
    if (quantity <= 0) {
      const result = await removeFromCart(productId);
      
      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: result.data
      }, { status: result.success ? 200 : 400 });
    } else {
      // 更新商品数量
      const result = await updateCartItem(productId, quantity);
      
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
    }
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({
      success: false,
      error: '更新购物车失败，请重试'
    }, { status: 500 });
  }
}
