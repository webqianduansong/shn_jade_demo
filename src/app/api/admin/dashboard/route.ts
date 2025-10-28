import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export async function GET(request: NextRequest) {
  try {
    const range = Number(request.nextUrl.searchParams.get('days') || '7');
    const days = Math.max(1, Math.min(90, range));

    // 基础统计 - 分别查询以便更好的错误处理
    let productCount = 0;
    let categoryCount = 0;
    let pendingOrderCount = 0;

    try {
      productCount = await prisma.product.count();
    } catch (e) {
      console.error('Count products error:', e);
    }

    try {
      categoryCount = await prisma.category.count();
    } catch (e) {
      console.error('Count categories error:', e);
    }

    try {
      pendingOrderCount = await prisma.order.count({ where: { status: 'PENDING' } });
    } catch (e) {
      console.error('Count orders error:', e);
    }

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    const startOfStart = dayStart(start);

    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        where: { createdAt: { gte: startOfStart, lte: now } },
        select: { 
          id: true, 
          createdAt: true, 
          totalAmount: true, 
          status: true, 
          user: { select: { email: true } }, 
          items: { select: { quantity: true } } 
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (e) {
      console.error('Fetch orders error:', e);
      orders = [];
    }

    // 最近订单
    const recentOrders = orders.slice(0, 10).map((o) => ({
      id: o.id,
      userEmail: o.user?.email || 'Unknown',
      totalAmountCents: o.totalAmount || 0,
      status: o.status,
      itemsCount: o.items?.reduce((n: number, i: any) => n + (i.quantity || 0), 0) || 0,
      createdAt: o.createdAt,
    }));

    // 按天聚合收入和订单数
    const seriesMap = new Map<string, { date: string; orderCount: number; revenueCents: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startOfStart);
      d.setDate(startOfStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      seriesMap.set(key, { date: key, orderCount: 0, revenueCents: 0 });
    }
    orders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(0, 10);
      const bucket = seriesMap.get(key);
      if (bucket) {
        bucket.orderCount += 1;
        bucket.revenueCents += o.totalAmount || 0;
      }
    });
    const revenueSeries = Array.from(seriesMap.values());

    // 今日指标
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayBucket = seriesMap.get(todayKey);
    const todayOrderCount = todayBucket?.orderCount || 0;
    const todayRevenueCents = todayBucket?.revenueCents || 0;

    return NextResponse.json({
      metrics: { productCount, categoryCount, pendingOrderCount, todayOrderCount, todayRevenueCents },
      recentOrders,
      revenueSeries,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取仪表盘数据失败',
        metrics: { productCount: 0, categoryCount: 0, pendingOrderCount: 0, todayOrderCount: 0, todayRevenueCents: 0 },
        recentOrders: [],
        revenueSeries: []
      },
      { status: 500 }
    );
  }
}


