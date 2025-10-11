"use client";
import Link from 'next/link';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
import { Card, Button, Badge } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import DynamicText from './DynamicText';
import { StaticImageData } from 'next/image';
import { resolveSrc } from '@/lib/imageUtils';
import { useNotification } from './Notification';
import { useState } from 'react';
import './EnhancedProductCard/EnhancedProductCard.css';

const { Meta } = Card;

export default function EnhancedProductCard({
  id,
  name,
  nameEn,
  description,
  descriptionEn,
  image,
  price,
  locale,
  isNew = false,
  discount = 0,
}: {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string | StaticImageData;
  price: number;
  locale: string;
  isNew?: boolean;
  discount?: number;
}) {
  const t = useTranslations('site');
  const currentLocale = useLocale();
  const { showNotification } = useNotification();
  const [isAdding, setIsAdding] = useState(false);

  // 图片解析函数
  // 使用工具函数解析图片地址
  const src = resolveSrc(image);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      // 登录检查
      const me = await fetch('/api/auth/me');
      if (!me.ok) {
        window.location.href = `/${locale}/login?redirect=/${locale}/products/${id}`;
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 可以在这里添加快速预览逻辑
    console.log('Quick view:', id);
  };

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const actions = [
    <Button 
      key="cart"
      type="primary" 
      icon={<ShoppingCartOutlined />}
      onClick={handleAddToCart}
      loading={isAdding}
      size="small"
    >
      {t('cta')}
    </Button>,
    <Button 
      key="view"
      type="text" 
      icon={<EyeOutlined />}
      onClick={handleQuickView}
      size="small"
    >
      预览
    </Button>,
  ];

  return (
    <Link href={`/${locale}/products/${id}`} className="block">
      <Card
        className="jade-product-card h-full"
        hoverable
        actions={actions}
        cover={
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={src}
              alt={currentLocale === 'zh' ? name : nameEn}
              fill
              className="object-cover transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {/* 标签 */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNew && (
                <Badge.Ribbon text="NEW" color="blue" />
              )}
              {discount > 0 && (
                <Badge.Ribbon text={`-${discount}%`} color="red" />
              )}
            </div>
          </div>
        }
      >
        <Meta
          title={
            <div className="text-lg font-semibold line-clamp-1">
              <DynamicText 
                fallback={currentLocale === 'zh' ? name : nameEn}
              >
                {currentLocale === 'zh' ? name : nameEn}
              </DynamicText>
            </div>
          }
          description={
            <div className="space-y-2">
              <p className="text-sm text-secondary line-clamp-2 leading-relaxed">
                <DynamicText 
                  fallback={currentLocale === 'zh' ? description : descriptionEn}
                >
                  {currentLocale === 'zh' ? description : descriptionEn}
                </DynamicText>
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {discount > 0 ? (
                    <>
                      <span className="text-xl font-bold text-red-500">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ${price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      ${price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          }
        />
      </Card>
    </Link>
  );
}
