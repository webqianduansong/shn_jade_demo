"use client";
import { useEffect, useState } from 'react';
import { Spin, Result, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import CartClient from '@/components/CartClient';
import CartHeader from '@/components/cart/CartHeader';

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
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
  const [products, setProducts] = useState<Record<string, Product>>({});
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
          
          // 获取购物车中所有商品的详细信息
          if (data.data.length > 0) {
            const productIds = data.data.map((item: CartItem) => item.productId);
            await fetchProducts(productIds);
          }
          
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

    const fetchProducts = async (productIds: string[]) => {
      try {
        // 并发获取所有商品信息
        const productPromises = productIds.map(id => 
          fetch(`/api/products/${id}`).then(res => res.json())
        );
        
        const productResponses = await Promise.all(productPromises);
        
        const productMap: Record<string, Product> = {};
        productResponses.forEach(response => {
          if (response.success && response.data) {
            productMap[response.data.id] = response.data;
          }
        });
        
        console.log('[购物车] 获取商品信息成功:', Object.keys(productMap).length);
        setProducts(productMap);
      } catch (err) {
        console.error('[购物车] 获取商品信息失败:', err);
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
    const product = products[i.productId];
    if (!product) {
      console.warn('[购物车] 找不到商品:', i.productId);
      return null;
    }
    return {
      ...i,
      product: {
        ...product,
        category: product.category || 'jade',
        image: typeof product.image === 'string' ? product.image : product.image
      },
    };
  }).filter(Boolean) as any[];

  const totalAmount = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

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


