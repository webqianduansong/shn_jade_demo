import {getTranslations} from 'next-intl/server';
import {redirect} from 'next/navigation';
import {getCart, clearCart} from '@/store/cartActions';
import products from '@/data/products';
import CartClient from '@/components/CartClient';
import CartHeader from '@/components/cart/CartHeader';
import EmptyCart from '@/components/cart/EmptyCart';
import OrderSummary from '@/components/cart/OrderSummary';
import { Row, Col } from 'antd';

/**
 * 购物车页面
 * 显示用户添加到购物车的商品列表和订单摘要
 */
export default async function CartPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations('site');
  const cartT = await getTranslations('cart');
  
  // 获取购物车数据
  const cart = await getCart();
  const items = cart.map((i) => {
    const product = products.find((p) => p.id === i.productId)!;
    return {
      ...i,
      product: {
        ...product,
        category: 'jade', // 添加默认分类
        image: typeof product.image === 'string' ? product.image : product.image.src
      },
    };
  });
  const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  /**
   * 处理结账操作
   * 重定向到支付页面
   */
  async function onCheckout() {
    'use server';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        lineItems: items.map((i) => ({id: i.productId, quantity: i.quantity})),
      }),
    });
    const json = (await res.json()) as {url?: string};
    if (json.url) {
      redirect(json.url);
    }
  }

  /**
   * 清空购物车
   */
  async function handleClearCart() {
    'use server';
    await clearCart();
  }

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      {/* 购物车页面头部 */}
      <CartHeader 
        itemCount={items.length}
        onClearCart={handleClearCart}
        locale={locale}
      />
      
      <CartClient 
        items={items}
        totalAmount={totalAmount}
        locale={locale}
        onCheckout={onCheckout}
      />
    </div>
  );
}


