import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 通过 Stripe Session ID 获取订单信息
 * GET /api/orders/by-session/[session_id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: '缺少 session_id' },
        { status: 400 }
      );
    }

    // 从数据库查询订单
    const order = await prisma.order.findFirst({
      where: {
        paymentRef: session_id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 返回订单信息
    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalCents: order.totalCents,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (error) {
    console.error('[Get Order by Session] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取订单失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

