"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin } from 'antd';
import OrdersClient from './OrdersClient';
import { apiGet } from '@/lib/apiClient';

export default function AdminOrdersPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    
    // 设置超时：最多加载 5 秒
    const timeoutId = setTimeout(() => {
      console.log('[Orders] 加载超时，显示空列表');
      setLoading(false);
    }, 5000);

    try {
      const result = await apiGet('/api/admin/orders', { showError: false });
      clearTimeout(timeoutId);
      
      if (result.success && result.data) {
        setOrders(result.data);
        console.log('[Orders] 加载成功:', result.data.length, '条订单');
      } else {
        console.warn('[Orders] API 返回失败，显示空列表');
        setOrders([]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Orders] 加载失败:', error);
      setOrders([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // 数据加载中
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载数据中...' : 'Loading data...'} />
      </div>
    );
  }

  return <OrdersClient orders={orders as any} />;
}


