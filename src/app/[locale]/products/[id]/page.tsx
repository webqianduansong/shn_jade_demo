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
  const product = {
    id: db.id,
    name: db.name,
    nameEn: db.name,
    description: db.description || '',
    descriptionEn: db.description || '',
    price: Math.round((db.price || 0) / 100),
    images: (db.images || []).map((img) => img.url),
  } as any;

  return (
    <div className="bg-white">
      <ProductDetailLayout product={product} locale={locale} />
    </div>
  );
}


