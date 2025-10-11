import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import CategoryPageClient from '@/components/CategoryPageClient';

export default async function ProductsListingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  const dbProducts = await prisma.product.findMany({ include: { images: true }, orderBy: { createdAt: 'desc' } });
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    nameEn: p.name,
    description: '',
    descriptionEn: '',
    price: Math.round((p.price || 0) / 100),
    image: (p.images && p.images[0] && p.images[0].url) ? p.images[0].url : '/images/placeholder.png',
  }));

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <CategoryPageClient products={products} locale={locale} />
      </div>
    </div>
  );
}


