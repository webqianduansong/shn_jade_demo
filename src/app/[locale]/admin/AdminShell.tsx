"use client";
import type { ReactNode } from 'react';
import { Layout, Menu, Button } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import './admin.css';

const { Header, Sider, Content } = Layout;

export default function AdminShell({ children, locale }: { children: ReactNode; locale: string }) {
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        // 使用 window.location 强制刷新页面并跳转
        window.location.href = `/${locale}/admin/login`;
      }
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220} className="admin-sider">
        <div className="admin-logo">
          玉石管理系统
        </div>
        <Menu
          mode="inline"
          className="admin-menu"
          defaultSelectedKeys={[typeof window !== 'undefined' ? window.location.pathname.split('/').at(-1) || 'dashboard' : 'dashboard']}
          items={[
            { key: 'admin', label: <Link href={`/${locale}/admin`}>仪表盘</Link> },
            { key: 'products', label: <Link href={`/${locale}/admin/products`}>商品管理</Link> },
            { key: 'categories', label: <Link href={`/${locale}/admin/categories`}>分类管理</Link> },
            { key: 'orders', label: <Link href={`/${locale}/admin/orders`}>订单管理</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="admin-header-title">
            管理后台
          </div>
          <div className="admin-header-actions">
            <div className="admin-user-info">
              <UserOutlined />
              <span>管理员</span>
            </div>
            <Button 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              退出登录
            </Button>
          </div>
        </Header>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}


