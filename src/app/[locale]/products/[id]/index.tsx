import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import products from '@/data/products';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductDescription from '@/components/product/ProductDescription';

/**
 * 产品详情页面
 * 展示单个产品的详细信息，包括图片、价格、描述等
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const t = await getTranslations();
  
  // 根据ID查找产品
  const product = products.find((p) => p.id === id);
  if (!product) {
    notFound();
  }


  return (
    <>
      {/* 面包屑导航 */}
      <ProductBreadcrumb 
        productName={product.name}
        productNameEn={product.nameEn}
        locale={locale}
      />

      {/* 主要产品区域 - 参考GRANSKY JEWELLERY布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* 产品图片画廊 - 左侧 */}
          <div className="order-1 lg:order-1">
            <ProductImageGallery 
              product={product}
            />
          </div>
          
          {/* 产品信息 - 右侧 */}
          <div className="order-2 lg:order-2">
            <ProductInfo 
              product={product}
              locale={locale}
            />
          </div>
        </div>
        
        {/* 产品描述和详情 - 全宽显示 */}
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