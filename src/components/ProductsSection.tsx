"use client";
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import products from '@/data/products';

/**
 * 产品展示区域组件
 * 包含热门产品和新品推荐两个部分
 */
interface ProductsSectionProps {
  locale: string; // 当前语言环境
}

export default function ProductsSection({ locale }: ProductsSectionProps) {
  const t = useTranslations('sections'); // 区域相关翻译
  const actionsT = useTranslations('actions'); // 操作相关翻译

  return (
    <>
      {/* 热门产品区域 */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title-left">{t('popular')}</h2>
            <a href={`/${locale}/products`} className="view-all-btn">
              {actionsT('viewAll')}
            </a>
          </div>
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} locale={locale} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* 新品推荐区域 */}
      <section className="new-arrivals-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title-left">{t('newArrivals')}</h2>
            <a href={`/${locale}/products`} className="view-all-btn">
              {actionsT('viewAll')}
            </a>
          </div>
          <div className="products-grid">
            {products.slice(0, 3).map((p) => (
              <ProductCard key={`new-${p.id}`} locale={locale} {...p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
