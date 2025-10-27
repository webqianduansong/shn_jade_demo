"use client";
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * 产品分类展示组件
 * 展示不同类别的玉石产品
 */
interface CategoriesSectionProps {
  locale: string; // 当前语言环境
}

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  products: Array<{
    images: Array<{ url: string }>;
  }>;
  _count: {
    products: number;
  };
};

export default function CategoriesSection({ locale }: CategoriesSectionProps) {
  const t = useTranslations('sections'); // 区域相关翻译
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从API获取分类数据
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('获取分类失败:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">{t('categories')}</h2>
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // 如果没有分类，不显示这个区域
  }

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">{t('categories')}</h2>
        <div className="categories-grid">
          {categories.map((category) => {
            // 优先使用分类自己的图片，其次使用分类下第一个商品的图片，最后使用占位图片
            const imageUrl = category.image || category.products[0]?.images[0]?.url || '/images/placeholder.png';
            
            return (
              <a 
                key={category.id} 
                href={`/${locale}/category/${category.id}`}
                className="category-card"
              >
                <Image 
                  src={imageUrl}
                  alt={category.name}
                  width={280}
                  height={280}
                  className="category-image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="category-content">
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-description">
                    {t('productsCount', { count: category._count.products })}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
