import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 获取订单列表
 * GET /api/orders?status=pending
 */
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // 构建查询条件
    const where: any = {
      userId: session.id
    };
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    // 获取订单列表
    const orders = await prisma.order.findMany({
      where,
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || ''
      }))
    }));
    
    return NextResponse.json({
      success: true,
      data: { orders: formattedOrders }
    });
    
  } catch (error: any) {
    console.error('[Orders API] Error:', error);
    
    // 如果是数据库表不存在的错误，返回空列表
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.warn('[Orders API] Order table does not exist yet, returning empty list');
      return NextResponse.json({
        success: true,
        data: { orders: [] },
        message: '数据库表尚未创建，请先执行数据库迁移'
      });
    }
    
    return NextResponse.json(
      { success: false, error: '获取订单列表失败' },
      { status: 500 }
    );
  }
}
