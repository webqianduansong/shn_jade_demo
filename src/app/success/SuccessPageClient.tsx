"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Result, Button, Spin, message } from 'antd';
import { CheckCircleOutlined, ShoppingCartOutlined, UnorderedListOutlined } from '@ant-design/icons';

/**
 * 支付成功页面客户端组件
 * 显示支付成功信息，并引导用户返回购物车或查看订单
 */
export default function SuccessPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams?.get('session_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 获取订单信息
    const fetchOrder = async () => {
      if (!session_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/by-session/${session_id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setOrder(data.data);
            
            // 显示成功提示
            message.success({
              content: '支付成功！订单已创建',
              duration: 3,
            });
            
            // 清空购物车
            try {
              await fetch('/api/cart/clear', { method: 'POST' });
            } catch (err) {
              console.error('Failed to clear cart:', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session_id]);

  // 倒计时自动跳转
  useEffect(() => {
    if (!loading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push('/zh/cart');
    }
  }, [loading, countdown, router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="加载订单信息..." />
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '60px auto', 
      padding: '20px' 
    }}>
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
        title={<span style={{ fontSize: '28px', fontWeight: 'bold' }}>支付成功！</span>}
        subTitle={
          order ? (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '16px', marginBottom: '10px', color: '#666' }}>
                订单号：<strong style={{ color: '#333' }}>{order.orderNo || order.id}</strong>
              </p>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                支付金额：<strong style={{ color: '#52c41a', fontSize: '24px' }}>
                  ${((order.totalCents || order.totalAmount || 0) / 100).toFixed(2)}
                </strong>
              </p>
              {order.items && order.items.length > 0 && (
                <div style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>商品清单：</p>
                  {order.items.map((item: any) => (
                    <p key={item.id} style={{ marginBottom: '5px' }}>
                      • {item.productName} × {item.quantity}
                    </p>
                  ))}
                </div>
              )}
              <p style={{ color: '#999', marginTop: '30px', fontSize: '14px' }}>
                {countdown} 秒后自动返回购物车...
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>感谢您的购买！</p>
              <p style={{ color: '#999', marginTop: '20px', fontSize: '14px' }}>
                {countdown} 秒后自动返回购物车...
              </p>
            </div>
          )
        }
        extra={[
          <Button 
            type="primary" 
            key="cart"
            icon={<ShoppingCartOutlined />}
            onClick={() => router.push('/zh/cart')}
            size="large"
            style={{ marginRight: '10px' }}
          >
            返回购物车
          </Button>,
          <Button 
            key="orders"
            icon={<UnorderedListOutlined />}
            onClick={() => router.push('/zh/profile?tab=orders')}
            size="large"
          >
            查看我的订单
          </Button>,
        ]}
      />
    </div>
  );
}

