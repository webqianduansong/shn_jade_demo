"use client";
import { useEffect, useState } from 'react';
import { Spin, Result, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import products from '@/data/products';
import CartClient from '@/components/CartClient';
import CartHeader from '@/components/cart/CartHeader';

interface CartItem {
  productId: string;
  quantity: number;
}

/**
 * 购物车页面
 * 显示用户添加到购物车的商品列表和订单摘要
 */
export default function CartPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('[购物车] 5秒超时，停止加载');
        setLoading(false);
        setCart([]);
      }
    }, 5000);

    const fetchCart = async () => {
      try {
        console.log('[购物车] 开始获取购物车数据');
        const response = await fetch('/api/cart/get');
        const data = await response.json();

        if (!mounted) return;

        if (response.ok && data.success) {
          console.log('[购物车] 获取成功，商品数:', data.data.length);
          setCart(data.data);
          setError(null);
        } else {
          console.error('[购物车] 获取失败:', data.message);
          setError(data.message || (locale === 'zh' ? '获取购物车失败' : 'Failed to load cart'));
          setCart([]);
        }
      } catch (err) {
        console.error('[购物车] 请求失败:', err);
        if (mounted) {
          setError(locale === 'zh' ? '加载失败，请重试' : 'Failed to load, please try again');
          setCart([]);
        }
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [locale]);

  const handleClearCart = async () => {
    try {
      const response = await fetch('/api/cart/clear', { method: 'POST' });
      if (response.ok) {
        message.success(locale === 'zh' ? '购物车已清空' : 'Cart cleared');
        setCart([]);
        router.refresh();
      } else {
        message.error(locale === 'zh' ? '清空失败' : 'Failed to clear cart');
      }
    } catch (error) {
      console.error('清空购物车失败:', error);
      message.error(locale === 'zh' ? '清空失败' : 'Failed to clear cart');
    }
  };

  const items = cart.map((i) => {
    const product = products.find((p) => p.id === i.productId);
    if (!product) return null;
    return {
      ...i,
      product: {
        ...product,
        category: 'jade',
        image: typeof product.image === 'string' ? product.image : product.image.src
      },
    };
  }).filter(Boolean) as any[];

  const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        backgroundColor: '#f9fafb'
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载购物车...' : 'Loading cart...'} />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '24px',
      minHeight: '60vh'
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
      />
    </div>
  );
}


