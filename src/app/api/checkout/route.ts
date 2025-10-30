import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    
    const {lineItems, shippingAddress, addressId} = (await request.json()) as { 
      lineItems: { id: string; quantity: number }[],
      shippingAddress?: any,
      addressId?: string
    };
    
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // 友好的错误提示
    if (!stripeKey || !siteUrl) {
      console.error('[Checkout API] 缺少必要的环境变量:');
      console.error('- STRIPE_SECRET_KEY:', stripeKey ? '已配置' : '❌ 未配置');
      console.error('- NEXT_PUBLIC_SITE_URL:', siteUrl ? '已配置' : '❌ 未配置');
      console.error('请参考文档: docs/Stripe支付配置指南.md');
      
      return NextResponse.json({
        error: '支付服务未配置',
        message: '请联系管理员配置 Stripe 支付服务。开发者请查看: docs/Stripe支付配置指南.md',
        details: {
          stripeConfigured: !!stripeKey,
          siteUrlConfigured: !!siteUrl
        }
      }, {status: 500});
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
    
    // 计算订单金额（已经是分）
    const subtotalCents = lineItems.reduce((sum, li) => {
      const p = productMap.get(li.id);
      return p ? sum + p.price * li.quantity : sum;
    }, 0);
    
    // 运费计算（满100美元免运费）
    const shippingCents = subtotalCents >= 10000 ? 0 : 444; // $4.44
    const totalCents = subtotalCents + shippingCents;
    
    const userRecord = user.id
      ? { id: user.id }
      : await prisma.user.findUnique({ where: { email: user.email } });
    
    // 获取收货地址信息
    let addressData = shippingAddress || {};
    if (addressId && userRecord?.id) {
      const address = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: userRecord.id,
        },
      });
      
      if (address) {
        addressData = {
          fullName: address.fullName,
          phone: address.phone,
          email: address.email,
          country: address.country,
          state: address.state,
          city: address.city,
          district: address.district,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          postalCode: address.postalCode,
        };
      }
    }
    
    // 创建 Stripe Checkout Session
    // 支持多种支付方式：信用卡、支付宝、微信支付
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items,
      // 启用的支付方式（需在 Stripe Dashboard 中先启用）
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      // 配置微信支付选项（必需）
      payment_method_options: {
        wechat_pay: {
          client: 'web',  // 指定为网页支付
        },
      },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,
      // 可选：添加客户邮箱
      customer_email: user.email,
      // 可选：添加元数据
      metadata: {
        userId: userRecord?.id || '',
        userEmail: user.email,
      },
    });
    
    if (userRecord?.id) {
      // 生成唯一订单号
      const orderNo = `ORD${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      // 创建订单草稿并保存会话ID作为 paymentRef
      const orderData: any = {
        userId: userRecord.id,
        orderNo,
        status: 'PENDING',
        shippingAddress: addressData, // 使用完整的地址信息
        subtotalCents,
        shippingCents,
        discountCents: 0,
        totalCents,
        paymentMethod: 'stripe',
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
      };
      
      // 添加地址 ID（如果存在）
      if (addressId) {
        orderData.shippingAddressId = addressId;
      }
      
      await prisma.order.create({ data: orderData });
    }
    
    return NextResponse.json({id: session.id, url: session.url});
  } catch (error) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json(
      { error: '结账失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


