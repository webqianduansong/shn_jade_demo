import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let order = null as null | { id: string; status: string; totalAmount: number };
  if (session_id) {
    const o = await prisma.order.findFirst({ where: { paymentRef: session_id } });
    if (o) {
      order = { id: o.id, status: o.status, totalAmount: o.totalAmount };
    }
  }
  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment successful</h1>
      {order ? (
        <div>
          <p className="mb-2">订单号：{order.id}</p>
          <p className="mb-2">订单状态：{order.status}</p>
          <p>支付金额：${(order.totalAmount / 100).toFixed(2)}</p>
        </div>
      ) : (
        <p>Thank you for your purchase.</p>
      )}
    </div>
  );
}


