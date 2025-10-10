"use client";
import type { ReactNode } from 'react';
import { Layout, Menu, Button } from 'antd';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

export default function AdminShell({ children, locale }: { children: ReactNode; locale: string }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220} style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 700 }}>Admin</div>
        <Menu
          mode="inline"
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
        <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
          <form action="/api/admin/logout" method="post">
            <Button htmlType="submit">退出登录</Button>
          </form>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}


