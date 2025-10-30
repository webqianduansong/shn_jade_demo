'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, Drawer, Button, Divider } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import LanguageSwitcher from './LanguageSwitcher';
import './MobileNav/MobileNav.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MobileNavProps {
  locale: string;
  categories: Category[];
}

export default function MobileNav({ locale, categories }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('nav');

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
