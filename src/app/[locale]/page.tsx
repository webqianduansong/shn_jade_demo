import {getTranslations} from 'next-intl/server';
import HomePageClient from '@/components/HomePageClient';
import { prisma } from '@/lib/db';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  
  // 并行获取所有数据 - 显著提升性能，添加错误处理
  const [categories, hotProducts, newProducts, banners] = await Promise.all([
    // 获取分类列表（包含第一个商品的图片）
    prisma.category.findMany({
      include: {
        products: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    }).catch((error) => {
      console.error('获取分类列表失败:', error?.message || error);
      return [];
    }),
    
    // 获取热门商品
    prisma.product.findMany({
      where: { isHot: true },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }).catch((error) => {
      console.error('获取热门商品失败:', error?.message || error);
      return [];
    }),
    
    // 获取新品
    prisma.product.findMany({
      where: { isNew: true },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }).catch((error) => {
      console.error('获取新品失败:', error?.message || error);
      return [];
    }),
    
    // 获取轮播图 - 只获取启用的，按排序升序
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }).catch((error) => {
      console.error('获取轮播图失败:', error?.message || error);
      return [];
    }),
  ]);

  // 只返回有商品的分类
  const categoriesWithProducts = categories.filter(c => c.products.length > 0);

  // 转换数据格式，确保类型匹配
  const formattedHotProducts = hotProducts.map(p => ({
    ...p,
    category: p.category || undefined,
  }));

  const formattedNewProducts = newProducts.map(p => ({
    ...p,
    category: p.category || undefined,
  }));

  return (
    <HomePageClient 
      locale={locale}
      categories={categoriesWithProducts}
      hotProducts={formattedHotProducts}
      newProducts={formattedNewProducts}
      banners={banners}
    />
  );
}


