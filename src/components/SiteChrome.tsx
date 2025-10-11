"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { ReactNode } from 'react';

export default function SiteChrome({ locale, children }: { locale: string; children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes('/admin');
  return (
    <div className="min-h-screen bg-white">
      {!isAdmin && <Header locale={locale} />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}


