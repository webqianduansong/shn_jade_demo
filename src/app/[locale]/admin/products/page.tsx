import { prisma } from '@/lib/db';
import ProductsClient from './ProductsClient';

export default async function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { images: true, category: true }, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  return <ProductsClient products={products} categories={categories} locale={locale} />;
}


