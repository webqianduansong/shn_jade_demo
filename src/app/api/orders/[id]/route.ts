import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 获取订单详情
 * GET /api/orders/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    // 获取订单详情
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  take: 1,
                  orderBy: {
                    sortOrder: 'asc'
                  }
                }
              }
            }
          }
        },
        tracking: true
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }
    
    // 格式化订单数据
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || ''
      }))
    };
    
    return NextResponse.json({
      success: true,
      data: { order: formattedOrder }
    });
    
  } catch (error: any) {
    console.error('[Order Detail API] Error:', error);
    
    // 如果是数据库表不存在的错误
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: '数据库表尚未创建，请先执行数据库迁移',
        code: 'DB_NOT_READY'
      }, { status: 503 });
    }
    
    return NextResponse.json(
      { success: false, error: '获取订单详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 取消订单
 * PUT /api/orders/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();
    const { action } = body;
    
    // 验证订单是否属于当前用户
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.id
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }
    
    // 处理不同的操作
    if (action === 'cancel') {
      // 只有待支付的订单可以取消
      if (order.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, error: '该订单状态不允许取消' },
          { status: 400 }
        );
      }
      
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
      
      return NextResponse.json({
        success: true,
        data: { order: updatedOrder },
        message: '订单已取消'
      });
    }
    
    if (action === 'confirm') {
      // 只有已发货的订单可以确认收货
      if (order.status !== 'SHIPPED') {
        return NextResponse.json(
          { success: false, error: '该订单状态不允许确认收货' },
          { status: 400 }
        );
      }
      
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });
      
      return NextResponse.json({
        success: true,
        data: { order: updatedOrder },
        message: '确认收货成功'
      });
    }
    
    return NextResponse.json(
      { success: false, error: '无效的操作' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('[Order Update API] Error:', error);
    
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: '数据库表尚未创建，请先执行数据库迁移',
        code: 'DB_NOT_READY'
      }, { status: 503 });
    }
    
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

