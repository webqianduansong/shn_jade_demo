import { prisma } from '@/lib/db';
import OrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
  return <OrdersClient orders={orders as any} />;
}


