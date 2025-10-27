"use client";
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { LogoutOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';
import './admin.css';

const { Header, Sider, Content } = Layout;

export default function AdminShell({ children, locale }: { children: ReactNode; locale: string }) {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const menuItems = [
    { key: 'admin', label: <Link href={`/${locale}/admin`}>仪表盘</Link> },
    { key: 'products', label: <Link href={`/${locale}/admin/products`}>商品管理</Link> },
    { key: 'categories', label: <Link href={`/${locale}/admin/categories`}>分类管理</Link> },
    { key: 'orders', label: <Link href={`/${locale}/admin/orders`}>订单管理</Link> },
  ];

  const MenuComponent = (
    <Menu
      mode="inline"
      className="admin-menu"
      defaultSelectedKeys={[typeof window !== 'undefined' ? window.location.pathname.split('/').at(-1) || 'dashboard' : 'dashboard']}
      items={menuItems}
      onClick={() => isMobile && setMobileMenuVisible(false)}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="admin-header">
        <div className="admin-header-left">
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="admin-menu-btn"
            />
          )}
          <div className="admin-header-logo">临熙珠宝玉石管理系统</div>
          <div className="admin-header-title"></div>
        </div>
        <div className="admin-header-actions">
          {!isMobile && (
            <div className="admin-user-info">
              <UserOutlined />
              <span>管理员</span>
            </div>
          )}
          <Button 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="admin-logout-btn"
            title={isMobile ? '退出登录' : ''}
          >
            {!isMobile && '退出登录'}
          </Button>
        </div>
      </Header>
      <Layout>
        {!isMobile ? (
          <Sider theme="light" width={220} className="admin-sider">
            {MenuComponent}
          </Sider>
        ) : (
          <Drawer
            placement="left"
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            className="admin-mobile-drawer"
            width={280}
            styles={{
              body: { padding: 0 },
              header: { 
                background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
                borderBottom: '2px solid #2d5a3d'
              }
            }}
            title={
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '16px' }}>
                临熙珠宝玉石管理系统
              </div>
            }
          >
            {MenuComponent}
            <div className="admin-mobile-drawer-footer">
              <div className="admin-mobile-user-info">
                <UserOutlined style={{ fontSize: '20px', color: '#2d5a3d' }} />
                <div className="admin-mobile-user-text">
                  <div className="admin-mobile-user-name">管理员</div>
                  <div className="admin-mobile-user-role">系统管理员</div>
                </div>
              </div>
            </div>
          </Drawer>
        )}
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}


