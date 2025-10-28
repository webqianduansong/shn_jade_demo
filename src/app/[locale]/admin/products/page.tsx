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
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        apiGet('/api/admin/products', { showError: false }),
        apiGet('/api/admin/categories', { showError: false })
      ]);
      
      if (productsResult.success && productsResult.data) {
        // products API 返回 { success, list, total, ... }
        const data = productsResult.data as any;
        setProducts(data.list || data);
      }
      if (categoriesResult.success && categoriesResult.data) {
        // categories API 直接返回数组
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载中...' : 'Loading...'} />
      </div>
    );
  }

  return <ProductsClient products={products} categories={categories} locale={locale} />;
}


