import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { action, ids, payload } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ success: false, message: '缺少要操作的商品ID' }, { status: 400 });
  }
  if (action === 'delete') {
    await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, affected: ids.length });
  }
  if (action === 'repricePercent') {
    const percent = Number(payload?.percent || 0);
    const list = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, price: true } });
    await Promise.all(list.map((p) => prisma.product.update({ where: { id: p.id }, data: { price: Math.max(0, Math.round(p.price * (1 + percent / 100))) } })));
    return NextResponse.json({ success: true, affected: list.length });
  }
  return NextResponse.json({ success: false, message: '未知的批量操作' }, { status: 400 });
}


