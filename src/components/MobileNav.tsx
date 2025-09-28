'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, Drawer, Button, Divider } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import LanguageSwitcher from './LanguageSwitcher';
import './MobileNav/MobileNav.css';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('nav');
  const locale = useLocale();

  const menuItems = [
    {
      key: 'rings',
      label: <Link href={`/${locale}/category/rings`} onClick={() => setIsOpen(false)}>{t('rings')}</Link>,
    },
    {
      key: 'earrings',
      label: <Link href={`/${locale}/category/earrings`} onClick={() => setIsOpen(false)}>{t('earrings')}</Link>,
    },
    {
      key: 'necklaces',
      label: <Link href={`/${locale}/category/necklaces`} onClick={() => setIsOpen(false)}>{t('necklaces')}</Link>,
    },
    {
      key: 'bracelets',
      label: <Link href={`/${locale}/category/bracelets`} onClick={() => setIsOpen(false)}>{t('bracelets')}</Link>,
    },
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
