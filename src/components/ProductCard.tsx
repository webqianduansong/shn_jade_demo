"use client";
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
import DynamicText from './DynamicText';
import { StaticImageData } from 'next/image';
import { useNotification } from './Notification';
import { useState } from 'react';
import { resolveSrc } from '@/lib/imageUtils';
import './ProductCard/ProductCard.css';

/**
 * 产品卡片组件
 * 用于在商品列表中展示单个产品的基本信息
 */
interface ProductCardProps {
  id: string; // 产品ID
  name: string; // 产品中文名称
  nameEn: string; // 产品英文名称
  description: string; // 产品中文描述
  descriptionEn: string; // 产品英文描述
  image: string | StaticImageData; // 产品图片
  price: number; // 产品价格
  locale: string; // 当前语言环境
}

export default function ProductCard({
  id,
  name,
  nameEn,
  description,
  descriptionEn,
  image,
  price,
  locale
}: ProductCardProps) {
  const t = useTranslations('site'); // 网站相关翻译
  const currentLocale = useLocale(); // 当前语言环境
  const { showNotification, NotificationContainer } = useNotification(); // 通知功能
  const [isAdding, setIsAdding] = useState(false); // 添加购物车状态
  // 使用工具函数解析图片地址
  const src = resolveSrc(image);


  /**
   * 处理添加到购物车操作
   * @param e 鼠标点击事件
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({productId: id, quantity: 1}),
      });
      
      if (response.ok) {
        showNotification(
          currentLocale === 'zh' 
            ? `已将 ${name} 添加到购物车！` 
            : `Added ${nameEn} to cart!`,
          'success'
        );
      } else {
        showNotification(
          currentLocale === 'zh' 
            ? '添加失败，请重试' 
            : 'Failed to add to cart, please try again',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showNotification(
        currentLocale === 'zh' 
          ? '网络错误，请重试' 
          : 'Network error, please try again',
        'error'
      );
    } finally {
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  return (
    <>
      <Link href={`/${locale}/products/${id}`} className="product-card">
        <img src={src} alt={name} className="product-image" />
        <div className="product-info">
          <h3 className="product-title">
            <DynamicText
              fallback={currentLocale === 'zh' ? name : nameEn}
            >
              {currentLocale === 'zh' ? name : nameEn}
            </DynamicText>
          </h3>
          <p className="product-description">
            <DynamicText
              fallback={currentLocale === 'zh' ? description : descriptionEn}
            >
              {currentLocale === 'zh' ? description : descriptionEn}
            </DynamicText>
          </p>
          <div className="product-footer">
            <span className="product-price">${price}</span>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`btn btn-primary ${
                isAdding ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isAdding ? (
                <div className="flex">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{currentLocale === 'zh' ? '添加中...' : 'Adding...'}</span>
                </div>
              ) : (
                t('cta')
              )}
            </button>
          </div>
        </div>
      </Link>
      <NotificationContainer />
    </>
  );
}


