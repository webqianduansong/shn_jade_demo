import { getAdminUser } from '@/lib/adminAuth';
import DashboardClient, { type DashboardMetrics, type RecentOrderRow } from './DashboardClient';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export default async function AdminDashboardPage() {
  const admin = await getAdminUser();
  const jar = await cookies();
  const locale = jar.get('NEXT_LOCALE')?.value || 'zh-CN';

  let productCount = 0;
  let categoryCount = 0;
  let pendingOrderCount = 0;
  let todayOrderCount = 0;
  let todayRevenueCents = 0;
  let recentOrders: RecentOrderRow[] = [];

  try {
    const today = await getTodayRange();
    
    [productCount, categoryCount, pendingOrderCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: today.start, lte: today.end } },
      select: { id: true, totalAmount: true },
    });
    todayOrderCount = todayOrders.length;
    todayRevenueCents = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const recentOrdersRaw = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        user: { select: { email: true } },
        items: { select: { id: true, quantity: true } },
      },
    });

    recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      userEmail: o.user.email,
      totalAmountCents: o.totalAmount,
      status: o.status,
      itemsCount: o.items.reduce((n, i) => n + i.quantity, 0),
      createdAt: new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(o.createdAt),
    }));
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // Return empty data instead of crashing
  }

  const metrics: DashboardMetrics = {
    productCount,
    categoryCount,
    pendingOrderCount,
    todayOrderCount,
    todayRevenueCents,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div style={{ 
        marginBottom: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f3 100%)',
        borderRadius: '12px',
        border: '1px solid #e8f0ec',
        boxShadow: '0 2px 8px rgba(45, 90, 61, 0.08)'
      }}>
        <h1 style={{ 
          fontSize: '28px',
          fontWeight: 700,
          color: '#2d5a3d',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Admin Dashboard</h1>
        {admin && <p style={{ 
          fontSize: '15px',
          color: '#666',
          margin: 0
        }}>Welcome, {admin.email}</p>}
      </div>
      <DashboardClient metrics={metrics} recentOrders={recentOrders} locale={locale.startsWith('zh') ? 'zh' : 'en'} />
    </div>
  );
}


async function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}


