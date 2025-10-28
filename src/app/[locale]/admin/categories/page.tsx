"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin } from 'antd';
import CategoriesClient from './CategoriesClient';
import { apiGet } from '@/lib/apiClient';

export default function AdminCategoriesPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    
    // 设置超时：最多加载 5 秒
    const timeoutId = setTimeout(() => {
      console.log('[Categories] 加载超时，显示空列表');
      setLoading(false);
    }, 5000);

    try {
      const result = await apiGet('/api/admin/categories', { showError: false });
      clearTimeout(timeoutId);
      
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        console.warn('[Categories] API 返回失败，显示空列表');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Categories] 加载失败:', error);
    } finally {
      clearTimeout(timeoutId);
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
        <Spin size="large" tip={locale === 'zh' ? '加载数据中...' : 'Loading data...'} />
      </div>
    );
  }

  return <CategoriesClient categories={categories} />;
}


