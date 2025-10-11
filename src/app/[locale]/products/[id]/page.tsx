import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductDetailLayout from '@/app/[locale]/productDetail/ProductDetailLayout';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const t = await getTranslations();
  
  const db = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!db) {
    notFound();
  }
  const images = (db.images || []).map((img) => img.url);
  const product = {
    id: db.id,
    name: db.name,
    nameEn: db.name,
    description: db.description || '',
    descriptionEn: db.description || '',
    price: Math.round((db.price || 0) / 100),
    image: images[0] || '/images/placeholder.png',
    images,
    sku: db.sku || '',
    rating: typeof db.rating === 'number' ? db.rating : 0,
    reviewsCount: typeof db.reviewsCount === 'number' ? db.reviewsCount : 0,
    models: (db.model || '')
      ? String(db.model)
          .split(/[\,\|/;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  } as any;

  return (
    <div className="bg-white">
      <ProductDetailLayout product={product} locale={locale} />
    </div>
  );
}


