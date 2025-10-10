import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKey) {
    return NextResponse.json({error: 'Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY'}, {status: 500});
  }
  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({error: 'Invalid signature'}, {status: 400});
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentRef = session.id;
    await prisma.order.updateMany({
      where: { paymentRef },
      data: { status: 'PAID' },
    });
  }
  return NextResponse.json({received: true});
}


