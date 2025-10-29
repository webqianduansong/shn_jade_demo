"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin } from 'antd';
import ProductsClient from './ProductsClient';
import { apiGet } from '@/lib/apiClient';

export default function AdminProductsPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // 设置超时：最多加载 5 秒
    const timeoutId = setTimeout(() => {
      console.log('[Products] 加载超时，显示空列表');
      setLoading(false);
    }, 5000);

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        apiGet('/api/admin/products', { showError: false }),
        apiGet('/api/admin/categories', { showError: false })
      ]);
      
      clearTimeout(timeoutId);
      
      if (productsResult.success && productsResult.data) {
        // products API 返回 { success, list, total, ... }
        const data = productsResult.data as any;
        setProducts(data.list || data);
      } else {
        console.warn('[Products] 产品API返回失败，显示空列表');
      }
      
      if (categoriesResult.success && categoriesResult.data) {
        // categories API 直接返回数组
        setCategories(categoriesResult.data);
      } else {
        console.warn('[Products] 分类API返回失败，显示空列表');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Products] 加载失败:', error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // 数据加载中
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载数据中...' : 'Loading data...'} />
      </div>
    );
  }

  return <ProductsClient products={products} categories={categories} locale={locale} />;
}


