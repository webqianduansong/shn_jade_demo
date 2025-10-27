"use client";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

/**
 * 产品展示区域组件
 * 包含热门产品和新品推荐两个部分
 */
interface ProductsSectionProps {
  locale: string; // 当前语言环境
}

type Product = {
  id: string;
  name: string;
  price: number;
  images?: { url: string }[];
  category?: { name: string; slug: string };
};

export default function ProductsSection({ locale }: ProductsSectionProps) {
  const t = useTranslations('sections'); // 区域相关翻译
  const actionsT = useTranslations('actions'); // 操作相关翻译
  
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取热门商品
    fetch('/api/products/featured?type=hot&limit=8')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHotProducts(data.products || []);
        }
      })
      .catch(err => console.error('获取热门商品失败:', err));

    // 获取新品
    fetch('/api/products/featured?type=new&limit=4')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNewProducts(data.products || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('获取新品失败:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

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
