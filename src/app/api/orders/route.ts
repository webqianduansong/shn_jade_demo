import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt.toISOString(),
      paymentRef: order.paymentRef,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      address: order.address ? {
        line1: order.address.line1,
        line2: order.address.line2,
        city: order.address.city,
        state: order.address.state,
        country: order.address.country,
        postal: order.address.postal,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, message: '获取订单失败' },
      { status: 500 }
    );
  }
}

