import { prisma } from '@/lib/db';
import ProductsClient from './ProductsClient';

export default async function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const products = await prisma.product.findMany({ include: { images: true }, orderBy: { createdAt: 'desc' } });
  return <ProductsClient products={products} locale={locale} />;
}


