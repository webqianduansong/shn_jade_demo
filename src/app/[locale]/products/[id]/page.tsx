import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductDescription from '@/components/product/ProductDescription';

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
    image: (db.images && db.images[0] && db.images[0].url) ? db.images[0].url : '/images/placeholder.png',
  } as any;

  return (
    <>
      <ProductBreadcrumb 
        productName={product.name}
        productNameEn={product.nameEn}
        locale={locale}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="order-1 lg:order-1">
            <ProductImageGallery 
              product={product}
              locale={locale}
            />
          </div>
          <div className="order-2 lg:order-2">
            <ProductInfo 
              product={product}
              locale={locale}
            />
          </div>
        </div>
        <div className="mt-20">
          <ProductDescription 
            product={product}
            locale={locale}
          />
        </div>
      </div>
    </>
  );
}


