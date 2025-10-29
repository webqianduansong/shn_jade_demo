"use client";
import { useEffect, useState } from 'react';
import { Spin, Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import ProductDetailLayout from '@/app/[locale]/productDetail/ProductDetailLayout';
import { message } from 'antd';

interface ProductData {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  images?: string[];
  sku?: string;
  rating?: number;
  reviewsCount?: number;
  models?: string[];
}

export default function ProductDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const { locale, id } = params;
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('[产品详情] 5秒超时，停止加载');
        setLoading(false);
        setError(locale === 'zh' ? '加载超时，请重试' : 'Loading timeout, please try again');
      }
    }, 5000);

    const fetchProduct = async () => {
      try {
        console.log('[产品详情] 开始获取产品:', id);
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!mounted) return;

        if (response.ok && data.success) {
          console.log('[产品详情] 获取成功:', data.data.name);
          setProduct(data.data);
          setError(null);
        } else {
          console.error('[产品详情] 获取失败:', data.message);
          setError(data.message || (locale === 'zh' ? '产品不存在' : 'Product not found'));
        }
      } catch (err) {
        console.error('[产品详情] 请求失败:', err);
        if (mounted) {
          setError(locale === 'zh' ? '加载失败，请重试' : 'Failed to load, please try again');
        }
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [id, locale]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载中...' : 'Loading...'} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '48px 24px' }}>
        <Result
          status="error"
          title={locale === 'zh' ? '加载失败' : 'Failed to Load'}
          subTitle={error || (locale === 'zh' ? '产品不存在' : 'Product not found')}
          extra={[
            <Button key="back" onClick={() => router.push(`/${locale}`)}>
              {locale === 'zh' ? '返回首页' : 'Back to Home'}
            </Button>,
            <Button key="retry" type="primary" onClick={() => window.location.reload()}>
              {locale === 'zh' ? '重试' : 'Retry'}
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ProductDetailLayout product={product} locale={locale} />
    </div>
  );
}


