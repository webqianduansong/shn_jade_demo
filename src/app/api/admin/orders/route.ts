import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取订单列表（支持查询）
export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Orders API] Request received');
    
    const admin = await getAdminUser();
    console.log('[Admin Orders API] Admin user:', admin ? 'Authenticated' : 'Not authenticated');
    
    if (!admin) {
      console.log('[Admin Orders API] Unauthorized - no admin user');
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // 构建查询条件
    const where: any = {};
    
    // 订单号查询（模糊匹配）
    if (orderNo && orderNo.trim()) {
      where.orderNo = {
        contains: orderNo.trim()
      };
    }
    
    // 状态查询
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    // 日期范围查询
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // 设置为当天结束时间
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    console.log('[Admin Orders] Query params:', { orderNo, status, startDate, endDate });
    console.log('[Admin Orders] Where clause:', JSON.stringify(where, null, 2));

    console.log('[Admin Orders] Querying database...');
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('[Admin Orders] Query successful, found', orders.length, 'orders');
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('[Admin Orders API] ERROR:', error);
    console.error('[Admin Orders API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        success: false,
        error: '获取订单列表失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// 更新订单状态
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: '缺少订单ID或状态' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: '更新订单失败' },
      { status: 500 }
    );
  }
}

