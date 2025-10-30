import SiteChromeClient from './SiteChromeClient';
import type { ReactNode } from 'react';
import { prisma } from '@/lib/db';

export default async function SiteChrome({ locale, children }: { locale: string; children: ReactNode }) {
  // 在服务端获取分类数据
  let categories: { id: string; name: string; slug: string }[] = [];
  try {
    const dbCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });
    categories = dbCategories;
  } catch (error) {
    console.error('获取分类失败:', error);
    // 失败时使用空数组，不影响页面渲染
  }

  return <SiteChromeClient locale={locale} categories={categories}>{children}</SiteChromeClient>;
}


