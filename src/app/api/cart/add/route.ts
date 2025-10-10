import { NextRequest, NextResponse } from 'next/server';
import { addToCart } from '@/store/cartActions';
import { getAuthUser } from '@/lib/auth';

/**
 * 添加商品到购物车API端点
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }
    const { productId, quantity } = await request.json();
    
    // 使用更新后的addToCart函数，它现在返回结果对象
    const result = await addToCart(productId, quantity);
    
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
    console.error('Add to cart error:', error);
    return NextResponse.json({
      success: false,
      error: '添加到购物车失败，请重试'
    }, { status: 500 });
  }
}
