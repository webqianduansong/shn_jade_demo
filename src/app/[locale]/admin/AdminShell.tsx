"use client";
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  MenuOutlined, 
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { apiPost } from '@/lib/apiClient';
import TopLoadingBar from '@/components/TopLoadingBar';
import './admin.css';

const { Header, Sider, Content } = Layout;

export default function AdminShell({ children, locale }: { children: ReactNode; locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedKey, setSelectedKey] = useState('admin');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    if (pathname) {
      if (pathname.includes('/admin/products')) {
        setSelectedKey('products');
      } else if (pathname.includes('/admin/categories')) {
        setSelectedKey('categories');
      } else if (pathname.includes('/admin/orders')) {
        setSelectedKey('orders');
      } else if (pathname.includes('/admin/banners')) {
        setSelectedKey('banners');
      } else {
        setSelectedKey('admin');
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    const result = await apiPost('/api/admin/logout', {}, {
      showError: true,
      showSuccess: true,
      successMessage: locale === 'zh' ? '退出成功' : 'Logout successful'
    });
    
    if (result.success) {
      // 使用 window.location 强制刷新页面并跳转
      window.location.href = `/${locale}/admin/login`;
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (isMobile) {
      setMobileMenuVisible(false);
    }
    
    // 使用 router.push 进行导航
    const routes: Record<string, string> = {
      'admin': `/${locale}/admin`,
      'products': `/${locale}/admin/products`,
      'categories': `/${locale}/admin/categories`,
      'orders': `/${locale}/admin/orders`,
      'banners': `/${locale}/admin/banners`,
    };
    
    if (routes[key]) {
      router.push(routes[key]);
    }
  };

  const menuItems = [
    { 
      key: 'admin', 
      icon: <DashboardOutlined />,
      label: locale === 'zh' ? '仪表盘' : 'Dashboard'
    },
    { 
      key: 'banners', 
      icon: <PictureOutlined />,
      label: locale === 'zh' ? '轮播图管理' : 'Banners'
    },
    { 
      key: 'products', 
      icon: <ShoppingOutlined />,
      label: locale === 'zh' ? '商品管理' : 'Products'
    },
    { 
      key: 'categories', 
      icon: <AppstoreOutlined />,
      label: locale === 'zh' ? '分类管理' : 'Categories'
    },
    { 
      key: 'orders', 
      icon: <ShoppingCartOutlined />,
      label: locale === 'zh' ? '订单管理' : 'Orders'
    },
  ];

  const MenuComponent = (
    <Menu
      mode="inline"
      className="admin-menu"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <TopLoadingBar />
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
          <div className="admin-header-logo">临熙玉石管理系统</div>
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
                临熙玉石管理系统
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


