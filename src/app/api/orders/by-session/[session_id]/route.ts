import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 通过 Stripe Session ID 获取订单信息
 * 同时验证支付状态并更新订单
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

    // 如果订单还是 PENDING 状态，验证 Stripe 支付状态并更新
    if (order.status === 'PENDING') {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        try {
          const stripe = new Stripe(stripeKey);
          const session = await stripe.checkout.sessions.retrieve(session_id);
          
          // 如果支付成功，更新订单状态
          if (session.payment_status === 'paid') {
            const updatedOrder = await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'PAID',
                paidAt: new Date(),
              },
              include: {
                items: {
                  include: {
                    product: true
                  }
                }
              }
            });
            
            console.log(`[Order Status] 订单 ${order.orderNo} 状态已更新为 PAID`);
            
            // 返回更新后的订单
            return NextResponse.json({
              success: true,
              data: {
                id: updatedOrder.id,
                orderNo: updatedOrder.orderNo,
                status: updatedOrder.status,
                totalCents: updatedOrder.totalCents,
                subtotalCents: updatedOrder.subtotalCents,
                shippingCents: updatedOrder.shippingCents,
                createdAt: updatedOrder.createdAt,
                paidAt: updatedOrder.paidAt,
                items: updatedOrder.items.map(item => ({
                  id: item.id,
                  productId: item.productId,
                  productName: item.product.name,
                  quantity: item.quantity,
                  price: item.price
                }))
              }
            });
          }
        } catch (stripeError) {
          console.error('[Stripe Verification] Error:', stripeError);
          // 即使 Stripe 验证失败，仍然返回订单信息
        }
      }
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

