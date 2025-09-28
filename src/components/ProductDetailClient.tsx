"use client";
import { useState } from 'react';
import { useNotification } from './Notification';
import { useTranslations } from 'next-intl';
import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: unknown;
}

interface ProductDetailClientProps {
  product: Product;
  locale: string;
}

export default function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
  const { showNotification, NotificationContainer } = useNotification();
  const [isAdding, setIsAdding] = useState(false);
  const t = useTranslations('site');

  const handleAddToCart = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({productId: product.id, quantity: 1}),
      });
      
      if (response.ok) {
        showNotification(
          locale === 'zh' 
            ? `已将 ${product.name} 添加到购物车！` 
            : `Added ${product.nameEn} to cart!`,
          'success'
        );
      } else {
        showNotification(
          locale === 'zh' 
            ? '添加失败，请重试' 
            : 'Failed to add to cart, please try again',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showNotification(
        locale === 'zh' 
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
      <Button 
        type="default" 
        size="large"
        className="w-full h-12 text-lg border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
        onClick={handleAddToCart}
        loading={isAdding}
        disabled={isAdding}
      >
        {isAdding ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>{locale === 'zh' ? '添加中...' : 'Adding...'}</span>
          </div>
        ) : (
          locale === 'zh' ? '添加到购物车' : 'ADD TO CART'
        )}
      </Button>
      <NotificationContainer />
    </>
  );
}
