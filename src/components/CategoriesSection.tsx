"use client";
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { categories } from '@/data/categories';

/**
 * 产品分类展示组件
 * 展示不同类别的玉石产品
 */
interface CategoriesSectionProps {
  locale: string; // 当前语言环境
}

export default function CategoriesSection({ locale }: CategoriesSectionProps) {
  const t = useTranslations('sections'); // 区域相关翻译

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">{t('categories')}</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <a 
              key={category.id} 
              href={`/${locale}/category/${category.id}`}
              className="category-card"
            >
              <Image 
                src={category.image} 
                alt={category.name}
                width={280}
                height={280}
                className="category-image"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="category-content">
                <h3 className="category-title">{locale === 'zh' ? category.nameZh : category.name}</h3>
                <p className="category-description">
                  {locale === 'zh' ? category.descriptionZh : category.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
