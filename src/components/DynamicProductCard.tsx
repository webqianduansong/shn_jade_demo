"use client";
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
import {useDynamicTranslations} from '@/hooks/useDynamicTranslation';
import { resolveSrc } from '@/lib/imageUtils';
import { useNotification } from './Notification';
import { useState } from 'react';

interface DynamicProductCardProps {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  price: number;
  locale: string;
}

export default function DynamicProductCard({
  id,
  name,
  nameEn,
  description,
  descriptionEn,
  image,
  price,
  locale
}: DynamicProductCardProps) {
  const t = useTranslations('site');
  const currentLocale = useLocale();
  const { showNotification } = useNotification();
  const [isAdding, setIsAdding] = useState(false);
  
  // 批量翻译产品信息
  const sourceTexts = [
    currentLocale === 'zh' ? name : nameEn,
    currentLocale === 'zh' ? description : descriptionEn
  ];
  
  const { translatedTexts, isLoading } = useDynamicTranslations(sourceTexts);
  const [translatedName, translatedDescription] = translatedTexts;

  // 兼容三种写法：
  // 1) 远程地址字符串 http(s) → 经由 /api/img 代理
  // 2) 本地字符串 '/products/a.jpg' 或 'products/a.jpg' → 转换为以 / 开头
  // 3) 静态导入对象 import pic from '@/public/xxx.jpg' → 使用 pic.src
  // 使用工具函数解析图片地址
  const src = resolveSrc(image);


  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      // 先检查是否已登录
      const me = await fetch('/api/auth/me');
      if (!me.ok) {
        window.location.href = `/${locale}/login?redirect=/${locale}/productDetail?id=${id}`;
        return;
      }
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
    <Link href={`/${locale}/productDetail?id=${id}`} className="group block">
      <li className="card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          <img src={src} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-primary line-clamp-1 text-lg">
            {isLoading ? (
              <span className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 rounded w-3/4"></span>
            ) : (
              translatedName
            )}
          </h3>
          <p className="text-sm text-secondary line-clamp-2 leading-relaxed">
            {isLoading ? (
              <span className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-full"></span>
            ) : (
              translatedDescription
            )}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-primary text-xl">${price}</span>
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (currentLocale === 'zh' ? '添加中...' : 'Adding...') : t('cta')}
            </button>
          </div>
        </div>
      </li>
    </Link>
  );
}
