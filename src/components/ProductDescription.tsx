"use client";
import { useState } from 'react';
import { Product } from '@/data/products';

interface ProductDescriptionProps {
  product: Product;
  locale: string;
}

export default function ProductDescription({ product, locale }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const description = locale === 'zh' ? product.description : product.descriptionEn;
  const name = locale === 'zh' ? product.name : product.nameEn;

  return (
    <div className="space-y-8">
      {/* Description Section */}
      <div className="border-b border-gray-200 pb-8">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'zh' ? '商品描述' : 'Description'}
          </h2>
          <svg 
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {isExpanded && (
          <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
            <p className="text-lg">
              <strong>✅</strong> {locale === 'zh' 
                ? '这款耳环采用矩形翡翠，散发出鲜艳、半透明的绿色光泽，无论走到哪里都能轻松吸引目光。' 
                : 'The earrings feature rectangular jadeite stones that radiate a vivid, translucent green hue, effortlessly catching the light and turning heads wherever you go.'
              }
            </p>
            <p>
              {locale === 'zh' 
                ? '作为一件真正的艺术品，这些耳环展示了卓越的工艺和创新的设计，融合了永恒的优雅和现代的精致。' 
                : 'A true work of art, these earrings showcase exceptional craftsmanship and innovative design, blending timeless elegance with modern sophistication.'
              }
            </p>
            <p>
              {locale === 'zh' 
                ? '无论是送给自己还是心爱的人，这些翡翠耳钉都是任何珠宝系列中独特而精致的补充。它们天然的美丽和精致的设计使其成为一件真正特别的珍品，将被珍藏多年。' 
                : 'Whether as a gift for yourself or a loved one, these jadeite stud earrings are a unique and exquisite addition to any jewelry collection. Their natural beauty and refined design make them a truly special piece that will be cherished for years to come.'
              }
            </p>
            
            {/* Product Specifications */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">
                {locale === 'zh' ? '产品规格' : 'Product Specifications'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span><strong>{locale === 'zh' ? '宝石:' : 'Gemstones:'}</strong> {locale === 'zh' ? '天然A级翡翠，天然钻石' : 'Genuine natural Type A jadeite, genuine natural diamonds'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span><strong>{locale === 'zh' ? '颜色:' : 'Color:'}</strong> {locale === 'zh' ? '浓郁绿色/帝王绿' : 'Intense Green / Imperial Green'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span><strong>{locale === 'zh' ? '材质:' : 'Material:'}</strong> {locale === 'zh' ? '18K白金' : '18k white gold'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span><strong>{locale === 'zh' ? '翡翠尺寸:' : 'Jadeite Size:'}</strong> 13.2 x 10.1mm</span>
                </div>
              </div>
            </div>
            
            {/* Care Instructions */}
            <div className="bg-blue-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-blue-900 mb-4">
                {locale === 'zh' ? '保养说明' : 'Care Instructions'}
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>✅ {locale === 'zh' ? '所有珠宝都精心包装在我们的专属Gransky盒子中' : 'All of our jewelry is carefully wrapped in our signature Gransky boxes'}</p>
                <p>✅ {locale === 'zh' ? '避免直接接触刺激性化学品和蒸汽，用软布清洁' : 'Avoid direct contact with harsh chemicals and steam & clean with a soft cloth'}</p>
                <p>✅ {locale === 'zh' ? '如果您希望特别包装并包含礼品卡，请在结账时留言' : 'If you would like your order specially wrapped and include a gift card, please leave us a note at checkout'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
