"use client";
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';

/**
 * 产品展示区域组件
 * 包含热门产品和新品推荐两个部分
 */
type Product = {
  id: string;
  name: string;
  price: number;
  images?: { url: string }[];
  category?: { name: string; slug: string };
};

interface ProductsSectionProps {
  locale: string; // 当前语言环境
  hotProducts: Product[]; // 从服务端传入的热门商品
  newProducts: Product[]; // 从服务端传入的新品
}

export default function ProductsSection({ locale, hotProducts, newProducts }: ProductsSectionProps) {
  const t = useTranslations('sections'); // 区域相关翻译
  const actionsT = useTranslations('actions'); // 操作相关翻译

  return (
    <>
      {/* 热门产品区域 */}
      {hotProducts.length > 0 && (
        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title-left">{t('popular')}</h2>
              <a href={`/${locale}/products`} className="view-all-btn">
                {actionsT('viewAll')}
              </a>
            </div>
            <div className="products-grid">
              {hotProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  locale={locale}
                  id={p.id}
                  name={p.name}
                  price={p.price / 100} // 转换为元
                  image={p.images?.[0]?.url || ''}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 新品推荐区域 */}
      {newProducts.length > 0 && (
        <section className="new-arrivals-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title-left">{t('newArrivals')}</h2>
              <a href={`/${locale}/products`} className="view-all-btn">
                {actionsT('viewAll')}
              </a>
            </div>
            <div className="products-grid">
              {newProducts.map((p) => (
                <ProductCard 
                  key={`new-${p.id}`} 
                  locale={locale}
                  id={p.id}
                  name={p.name}
                  price={p.price / 100} // 转换为元
                  image={p.images?.[0]?.url || ''}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
