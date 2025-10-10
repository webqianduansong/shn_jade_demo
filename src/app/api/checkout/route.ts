import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import products from '@/data/products';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const {lineItems} = await request.json();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!stripeKey || !siteUrl) {
    return NextResponse.json({error: 'Missing STRIPE_SECRET_KEY or NEXT_PUBLIC_SITE_URL'}, {status: 500});
  }
  const stripe = new Stripe(stripeKey);
  const items: {price_data: Stripe.Checkout.SessionCreateParams.LineItem.PriceData; quantity: number}[] = [];
  for (const li of lineItems as {id: string; quantity: number}[]) {
    const product = products.find((p) => p.id === li.id);
    if (!product) continue;
    items.push({
      price_data: {
        currency: 'usd',
        product_data: {name: product.name},
        unit_amount: product.price * 100,
      },
      quantity: li.quantity,
    });
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    success_url: `${siteUrl}/success`,
    cancel_url: `${siteUrl}/cancel`,
  });
  return NextResponse.json({id: session.id, url: session.url});
}


