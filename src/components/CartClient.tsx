"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Grid } from 'antd';
import { useNotification } from './Notification';
import CartList from './cart/CartList';
import OrderSummary from './cart/OrderSummary';
import EmptyCart from './cart/EmptyCart';
import { CartItemWithProduct } from '@/types';

const { useBreakpoint } = Grid;

interface CartClientProps {
  items: CartItemWithProduct[];
  totalAmount: number;
  locale: string;
  onCheckout?: () => Promise<void>;
}

/**
 * 购物车客户端组件
 * 负责管理购物车页面的整体布局和结账流程
 */
export default function CartClient({ items, totalAmount, locale, onCheckout: externalCheckout }: CartClientProps) {
  const { NotificationContainer } = useNotification();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const screens = useBreakpoint();
  
  /**
   * 处理结账过程
   */
  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      // 登录检查
      const me = await fetch('/api/auth/me');
      if (!me.ok) {
        window.location.href = `/${locale}/login?redirect=/${locale}/cart`;
        return;
      }
      if (externalCheckout) {
        // 使用从页面传入的结账函数（server action）
        await externalCheckout();
      } else {
        // 默认的结账逻辑
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.url) {
          // 重定向到支付页面
          window.location.href = data.url;
        } else {
          throw new Error(data.message || 'Checkout failed');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 如果购物车为空
  if (items.length === 0) {
    return <EmptyCart locale={locale} />;
  }

  return (
    <>
      <Row gutter={[24, 24]}>
        {/* 购物车商品列表 */}
        <Col xs={24} lg={16}>
          <CartList 
            items={items}
            locale={locale}
          />
        </Col>
        
        {/* 订单摘要 */}
        <Col xs={24} lg={8}>
          <OrderSummary
            totalAmount={totalAmount}
            itemCount={items.length}
            locale={locale}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        </Col>
      </Row>
      <NotificationContainer />
    </>
  );
}
