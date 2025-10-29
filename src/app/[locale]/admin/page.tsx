"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin } from 'antd';
import DashboardClient, { type DashboardMetrics, type RecentOrderRow } from './DashboardClient';
import { apiGet } from '@/lib/apiClient';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminDashboardPage() {
  useAdminAuth(); // 验证管理员身份
  
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    productCount: 0,
    categoryCount: 0,
    pendingOrderCount: 0,
    todayOrderCount: 0,
    todayRevenueCents: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrderRow[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    loadAdminEmail();
    loadDashboardData();
  }, []);

  const loadAdminEmail = async () => {
    const result = await apiGet('/api/admin/me', { showError: false });
    if (result.success && result.data?.user) {
      setAdminEmail(result.data.user.email);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    
    // 设置超时：最多加载 5 秒
    const timeoutId = setTimeout(() => {
      console.log('[Dashboard] 加载超时，显示默认数据');
      setLoading(false);
    }, 5000);

    try {
      const result = await apiGet('/api/admin/dashboard?days=7', { 
        showError: false 
      });
      
      clearTimeout(timeoutId);
      
      if (result.success && result.data) {
        setMetrics(result.data.metrics || metrics);
        setRecentOrders(result.data.recentOrders || []);
      } else {
        console.warn('[Dashboard] API 返回失败，使用默认数据');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Dashboard] 加载失败，使用默认数据:', error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // 即使加载中也最多显示 5 秒，之后强制显示页面
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div style={{ 
        marginBottom: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f3 100%)',
        borderRadius: '12px',
        border: '1px solid #e8f0ec',
        boxShadow: '0 2px 8px rgba(45, 90, 61, 0.08)'
      }}>
        <h1 style={{ 
          fontSize: '28px',
          fontWeight: 700,
          color: '#2d5a3d',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {locale === 'zh' ? '管理仪表盘' : 'Admin Dashboard'}
        </h1>
        {adminEmail && <p style={{ 
          fontSize: '15px',
          color: '#666',
          margin: 0
        }}>
          {locale === 'zh' ? '欢迎,' : 'Welcome,'} {adminEmail}
        </p>}
      </div>
      <DashboardClient metrics={metrics} recentOrders={recentOrders} locale={locale} />
    </div>
  );
}


