import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import '../globals.css';
import AntdProvider from '@/components/AntdProvider';
import SiteChrome from '@/components/SiteChrome';
import {locales} from '@/i18n/request';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'LinxiJade - 临熙玉石',
  description: 'Exquisite jade jewelry with cultural heritage and contemporary design',
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!locales.includes(locale as unknown as typeof locales[number])) {
    notFound();
  }
  let messages: Record<string, string> | undefined;
  try {
    messages = (await import(`@/locales/${locale}.json`)).default;
  } catch {
    notFound();
  }
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AntdProvider>
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </AntdProvider>
    </NextIntlClientProvider>
  );
}


