import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const {lineItems} = (await request.json()) as { lineItems: { id: string; quantity: number }[] };
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!stripeKey || !siteUrl) {
    return NextResponse.json({error: 'Missing STRIPE_SECRET_KEY or NEXT_PUBLIC_SITE_URL'}, {status: 500});
  }
  const stripe = new Stripe(stripeKey);
  const ids = Array.isArray(lineItems) ? lineItems.map((li) => li.id) : [];
  const dbProducts = await prisma.product.findMany({ where: { id: { in: ids } } });
  const productMap = new Map(dbProducts.map((p) => [p.id, p] as const));
  const items: {price_data: Stripe.Checkout.SessionCreateParams.LineItem.PriceData; quantity: number}[] = [];
  for (const li of lineItems) {
    const product = productMap.get(li.id);
    if (!product) continue;
    items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        // DB 中 price 已为最小货币单位（分）
        unit_amount: product.price,
      },
      quantity: li.quantity,
    });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: '无有效商品' }, { status: 400 });
  }
  const totalAmount = lineItems.reduce((sum, li) => {
    const p = productMap.get(li.id);
    return p ? sum + p.price * li.quantity : sum;
  }, 0);
  const userRecord = user.id
    ? { id: user.id }
    : await prisma.user.findUnique({ where: { email: user.email } });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cancel`,
  });
  if (userRecord?.id) {
    // 创建订单草稿并保存会话ID作为 paymentRef
    await prisma.order.create({
      data: {
        userId: userRecord.id,
        status: 'PENDING',
        totalAmount,
        paymentRef: session.id,
        items: {
          create: lineItems
            .filter((li) => productMap.has(li.id))
            .map((li) => ({
              productId: li.id,
              price: productMap.get(li.id)!.price,
              quantity: li.quantity,
            })),
        },
      },
    });
  }
  return NextResponse.json({id: session.id, url: session.url});
}


