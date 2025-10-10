"use client";
import Link from 'next/link';
import { Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNav from './MobileNav';
import './Header/Header.css';
import { useEffect, useState } from 'react';

/**
 * 网站头部组件
 * 包含导航菜单、语言切换器和购物车图标
 */
interface HeaderProps {
  locale: string; // 当前语言环境
}

export default function Header({ locale }: HeaderProps) {
  const navT = useTranslations('nav'); // 导航相关翻译
  const siteT = useTranslations('site'); // 网站相关翻译
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!mounted) return;
        if (data?.user?.email) setUserEmail(data.user.email);
      })
      .catch(() => setUserEmail(null));
    return () => {
      mounted = false;
    };
  }, []);

  // 导航菜单项配置
  const menuItems = [
    {
      key: 'rings',
      label: navT('rings'),
      href: `/${locale}/category/rings`
    },
    {
      key: 'earrings', 
      label: navT('earrings'),
      href: `/${locale}/category/earrings`
    },
    {
      key: 'necklaces',
      label: navT('necklaces'),
      href: `/${locale}/category/necklaces`
    },
    {
      key: 'bracelets',
      label: navT('bracelets'),
      href: `/${locale}/category/bracelets`
    },
    {
      key: 'collections',
      label: navT('collections'),
      href: `/${locale}/#collections`
    },
  ];

  return (
    <header className="jade-header">
      <div className="header-container">
        {/* 左侧：移动端菜单和Logo */}
        <div className="flex">
          <MobileNav />
          <Link href={`/${locale}`} className="logo">
            Silk Road Jade
          </Link>
        </div>
        
        {/* 中间：桌面端导航菜单 */}
        <div className="nav">
          {menuItems.map((item) => (
            <Link key={item.key} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* 右侧：语言切换器、登录/登出、购物车 */}
        <div className="header-actions">
          <LanguageSwitcher currentLocale={locale} />
          {userEmail ? (
            <Button
              size="small"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                setUserEmail(null);
              }}
            >
              {locale === 'zh' ? '登出' : 'Logout'}
            </Button>
          ) : (
            <Link href={`/${locale}/login`} className="nav-link">
              {locale === 'zh' ? '登录' : 'Login'}
            </Link>
          )}
          <Link 
            href={`/${locale}/cart`} 
            className="cart-link"
          >
            <Badge count={0} size="small">
              <ShoppingCartOutlined />
            </Badge>
            <span className="hidden">{siteT('cart')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}