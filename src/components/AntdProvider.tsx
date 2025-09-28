'use client';

import React from 'react';
import { ConfigProvider, theme, App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { useLocale } from 'next-intl';

// 导入 Ant Design 语言包
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';
import frFR from 'antd/locale/fr_FR';
import deDE from 'antd/locale/de_DE';
import esES from 'antd/locale/es_ES';
import itIT from 'antd/locale/it_IT';
import ptBR from 'antd/locale/pt_BR';
import ruRU from 'antd/locale/ru_RU';
import arEG from 'antd/locale/ar_EG';

interface AntdProviderProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

// 语言包映射
const getAntdLocale = (locale: string) => {
  switch (locale) {
    case 'zh': return zhCN;
    case 'ja': return jaJP;
    case 'ko': return koKR;
    case 'fr': return frFR;
    case 'de': return deDE;
    case 'es': return esES;
    case 'it': return itIT;
    case 'pt': return ptBR;
    case 'ru': return ruRU;
    case 'ar': return arEG;
    default: return enUS;
  }
};

export default function AntdProvider({ children, isDarkMode = false }: AntdProviderProps) {
  let locale: string;
  let antdLocale;
  
  try {
    locale = useLocale();
    antdLocale = getAntdLocale(locale);
  } catch (error) {
    // 如果 next-intl 上下文不可用，使用默认值
    console.warn('next-intl context not available, using default locale');
    locale = 'en';
    antdLocale = getAntdLocale('en');
  }

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={antdLocale}
        direction={locale === 'ar' ? 'rtl' : 'ltr'}
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            // 自定义主题色，与玉石网站风格保持一致
            colorPrimary: '#10b981', // 翡翠绿主色调
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            borderRadius: 8,
            fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
          },
          components: {
            Button: {
              borderRadius: 8,
              fontWeight: 500,
            },
            Card: {
              borderRadius: 12,
              boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            },
            Input: {
              borderRadius: 8,
            },
            Select: {
              borderRadius: 8,
            },
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
