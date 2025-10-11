import { getAdminUser } from '@/lib/adminAuth';
import DashboardClient, { type DashboardMetrics, type RecentOrderRow } from './DashboardClient';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export default async function AdminDashboardPage() {
  const admin = await getAdminUser();
  const jar = await cookies();
  const locale = jar.get('NEXT_LOCALE')?.value || 'zh-CN';

  const [productCount, categoryCount, pendingOrderCount, today] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    getTodayRange(),
  ]);

  const todayOrders = await prisma.order.findMany({
    where: { createdAt: { gte: today.start, lte: today.end } },
    select: { id: true, totalAmount: true },
  });
  const todayOrderCount = todayOrders.length;
  const todayRevenueCents = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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

  const recentOrders: RecentOrderRow[] = recentOrdersRaw.map((o) => ({
    id: o.id,
    userEmail: o.user.email,
    totalAmountCents: o.totalAmount,
    status: o.status,
    itemsCount: o.items.reduce((n, i) => n + i.quantity, 0),
    createdAt: new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(o.createdAt),
  }));

  const metrics: DashboardMetrics = {
    productCount,
    categoryCount,
    pendingOrderCount,
    todayOrderCount,
    todayRevenueCents,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {admin && <p className="text-gray-600 mb-6">Welcome, {admin.email}</p>}
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


