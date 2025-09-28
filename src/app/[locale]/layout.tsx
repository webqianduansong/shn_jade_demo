import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import '../globals.css';
import AntdProvider from '@/components/AntdProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import {locales} from '@/i18n/request';

export const metadata: Metadata = {
  title: 'Silk Road Jade',
  description: 'Where the ancient Silk Road meets modern luxury',
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
        <div className="min-h-screen bg-white">
          <Header locale={locale} />
          <main>
            {children}
          </main>
          <Footer />
        </div>
      </AntdProvider>
    </NextIntlClientProvider>
  );
}


