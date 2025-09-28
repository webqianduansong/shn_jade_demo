"use client";
import { useState } from 'react';
import { Space, Divider, Empty } from 'antd';
import { useRouter } from 'next/navigation';
import { useNotification } from '../Notification';
import CartItem from './CartItem';
import { CartItemWithProduct } from '@/types';

interface CartListProps {
  items: CartItemWithProduct[];
  locale: string;
}

/**
 * 购物车商品列表组件
 */
export default function CartList({ items, locale }: CartListProps) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  /**
   * 更新购物车商品数量
   */
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(productId);
    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({productId, quantity: newQuantity}),
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        showNotification(
          locale === 'zh' ? '更新失败，请重试' : 'Update failed, please try again',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      showNotification(
        locale === 'zh' ? '网络错误，请重试' : 'Network error, please try again',
        'error'
      );
    } finally {
      setIsUpdating(null);
    }
  };

  /**
   * 从购物车移除商品
   */
  const removeItem = async (productId: string) => {
    setIsUpdating(productId);
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({productId}),
      });
      
      if (response.ok) {
        showNotification(
          locale === 'zh' ? '已从购物车中移除' : 'Removed from cart',
          'success'
        );
        router.refresh();
      } else {
        showNotification(
          locale === 'zh' ? '删除失败，请重试' : 'Delete failed, please try again',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      showNotification(
        locale === 'zh' ? '网络错误，请重试' : 'Network error, please try again',
        'error'
      );
    } finally {
      setIsUpdating(null);
    }
  };

  // 如果购物车为空，显示空状态
  if (items.length === 0) {
    return <Empty description={locale === 'zh' ? '购物车为空' : 'Your cart is empty'} />;
  }

  return (
    <Space direction="vertical" size="middle" className="w-full">
      {items.map((item, index) => (
        <div key={item.productId}>
          <CartItem
            item={item}
            locale={locale}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            isUpdating={isUpdating === item.productId}
          />
          {index < items.length - 1 && <Divider className="!my-4" />}
        </div>
      ))}
    </Space>
  );
}
