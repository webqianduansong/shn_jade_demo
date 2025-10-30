'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, Drawer, Button, Divider } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import LanguageSwitcher from './LanguageSwitcher';
import './MobileNav/MobileNav.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const t = useTranslations('nav');
  const locale = useLocale();

  // 获取分类列表
  useEffect(() => {
    let mounted = true;
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!mounted) return;
        if (data?.success && data?.categories) {
          setCategories(data.categories);
        }
      })
      .catch((error) => {
        console.error('获取分类失败:', error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 动态生成菜单项
  const menuItems = [
    ...categories.map((cat) => ({
      key: cat.slug,
      label: <Link href={`/${locale}/category/${cat.slug}`} onClick={() => setIsOpen(false)}>{cat.name}</Link>,
    })),
    {
      key: 'collections',
      label: <Link href={`/${locale}/#collections`} onClick={() => setIsOpen(false)}>{t('collections')}</Link>,
    },
  ];

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setIsOpen(true)}
        className="mobile-nav-button"
        size="large"
      />
      
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setIsOpen(false)}
        open={isOpen}
        width={280}
        className="mobile-nav-drawer"
      >
        <div className="space-y-4">
          {/* 语言切换器 */}
          <div className="px-2">
            <div className="text-sm text-gray-600 mb-2">选择语言 / Select Language</div>
            <LanguageSwitcher currentLocale={locale} />
          </div>
          
          <Divider />
          
          {/* 导航菜单 */}
          <Menu
            mode="vertical"
            items={menuItems}
            style={{
              border: 'none',
              background: 'transparent',
            }}
          />
        </div>
      </Drawer>
    </>
  );
}
