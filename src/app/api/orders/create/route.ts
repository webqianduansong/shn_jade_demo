import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 生成订单号
 * 格式: ORD + 年月日 + 6位随机数
 */
function generateOrderNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORD${year}${month}${day}${random}`;
}

/**
 * 创建订单
 * POST /api/orders/create
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }
    
    const session = JSON.parse(authCookie.value);
    const body = await request.json();
    
    const {
      shippingAddress,
      items,
      shippingMethod = '标准配送',
      paymentMethod = '在线支付',
      remark
    } = body;
    
    // 验证必填字段
    if (!shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '订单信息不完整' },
        { status: 400 }
      );
    }
    
    // 计算订单金额
    let subtotalCents = 0;
    const orderItems = [];
    
    for (const item of items) {
      // 获取商品信息
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: `商品不存在：${item.productId}` },
          { status: 400 }
        );
      }
      
      const itemSubtotal = product.price * item.quantity;
      subtotalCents += itemSubtotal;
      
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    // 计算运费（这里简化处理，实际应该根据配送方式和地区计算）
    const shippingCents = shippingMethod === '标准配送' ? 1500 : 3000; // 15元或30元
    
    // 计算优惠（这里简化处理，实际应该根据优惠券等计算）
    const discountCents = 0;
    
    // 总金额
    const totalCents = subtotalCents + shippingCents - discountCents;
    
    // 生成订单号
    const orderNo = generateOrderNo();
    
    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: session.userId,
        status: 'PENDING',
        shippingAddress,
        subtotalCents,
        shippingCents,
        discountCents,
        totalCents,
        shippingMethod,
        paymentMethod,
        remark,
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            price: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // 清空购物车
    try {
      const response = NextResponse.json({
        success: true,
        data: { order },
        message: '订单创建成功'
      });
      
      // 清除购物车cookie
      response.cookies.set('cart', JSON.stringify([]), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7天
      });
      
      return response;
    } catch (error) {
      console.error('[Order Create] Clear cart error:', error);
      return NextResponse.json({
        success: true,
        data: { order },
        message: '订单创建成功'
      });
    }
    
  } catch (error: any) {
    console.error('[Order Create API] Error:', error);
    
    // 如果是数据库表不存在的错误
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: '数据库表尚未创建，请先执行数据库迁移',
        code: 'DB_NOT_READY'
      }, { status: 503 });
    }
    
    return NextResponse.json(
      { success: false, error: '创建订单失败' },
      { status: 500 }
    );
  }
}

