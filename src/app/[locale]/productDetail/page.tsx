import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import products from '@/data/products';
import ProductDetailLayout from './ProductDetailLayout';

/**
 * 产品详情页面 - 新版本
 * 按照新的设计样式展示产品详细信息
 */
export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const {locale} = await params;
  const t = await getTranslations();

  // 从搜索参数中获取产品ID，如果没有，则使用默认ID
  const productId = typeof searchParams?.id === 'string' 
    ? searchParams.id 
    : '1'; // 默认产品ID
  
  // 根据ID查找产品
  const product = products.find((p) => p.id === productId);
  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white">
      <ProductDetailLayout 
        product={product}
        locale={locale}
      />
    </div>
  );
}
