"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopLoadingBar from '@/components/TopLoadingBar';
import type { ReactNode } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SiteChromeClientProps {
  locale: string;
  categories: Category[];
  children: ReactNode;
}

export default function SiteChromeClient({ locale, categories, children }: SiteChromeClientProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes('/admin');
  
  return (
    <div className="min-h-screen bg-white">
      <TopLoadingBar />
      {!isAdmin && <Header locale={locale} categories={categories} />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}

