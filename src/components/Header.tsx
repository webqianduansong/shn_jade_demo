"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Tooltip } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNav from './MobileNav';
import './Header/Header.css';
import { useEffect, useState } from 'react';

/**
 * 网站头部组件
 * 包含导航菜单、语言切换器和购物车图标
 */
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  locale: string; // 当前语言环境
  categories: Category[]; // 从服务端获取的分类列表
}

export default function Header({ locale, categories }: HeaderProps) {
  const router = useRouter();
  const navT = useTranslations('nav'); // 导航相关翻译
  const siteT = useTranslations('site'); // 网站相关翻译
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 获取用户信息
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

  // 动态生成导航菜单项
  const menuItems = [
    ...categories.map((cat) => ({
      key: cat.slug,
      label: cat.name,
      href: `/${locale}/category/${cat.slug}`
    })),
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
          <MobileNav locale={locale} categories={categories} />
          <Link href={`/${locale}`} className="logo">
            {locale === 'zh' ? '临熙玉石' : 'LinxiJade'}
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
          <div className="desktop-only">
            <LanguageSwitcher currentLocale={locale} />
          </div>
          {userEmail ? (
            <>
              <Tooltip title={locale === 'zh' ? '个人中心' : 'Profile'}>
                <Link href={`/${locale}/profile`} className="icon-link">
                  <UserAddOutlined className="icon-button-icon" />
                  <span className="desktop-only-text">{locale === 'zh' ? '个人中心' : 'Profile'}</span>
                </Link>
              </Tooltip>
              <Tooltip title={locale === 'zh' ? '登出' : 'Logout'}>
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setUserEmail(null);
                    // 退出后跳转到首页
                    router.push(`/${locale}`);
                  }}
                  className="icon-button"
                >
                  <span className="desktop-only-text">{locale === 'zh' ? '登出' : 'Logout'}</span>
                </Button>
              </Tooltip>
            </>
          ) : (
            <Tooltip title={locale === 'zh' ? '登录' : 'Login'}>
              <Link href={`/${locale}/login`} className="icon-link">
                <UserOutlined className="icon-button-icon" />
                <span className="desktop-only-text">{locale === 'zh' ? '登录' : 'Login'}</span>
              </Link>
            </Tooltip>
          )}
          <Tooltip title={siteT('cart')}>
            <Link 
              href={`/${locale}/cart`} 
              className="cart-link"
            >
              <Badge count={0} size="small">
                <ShoppingCartOutlined className="icon-button-icon" />
              </Badge>
              <span className="desktop-only-text">{siteT('cart')}</span>
            </Link>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}