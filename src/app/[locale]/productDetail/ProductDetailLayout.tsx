"use client";
import { Row, Col } from 'antd';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel';
import '@/styles/product-detail.css';

// 自定义样式
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f8f4f1', // 米色/浅粉色背景
};

interface ProductDetailLayoutProps {
  product: {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    price: number;
    image: unknown;
    images?: string[];
  };
  locale: string;
}

export default function ProductDetailLayout({ product, locale }: ProductDetailLayoutProps) {
  return (
    <div style={containerStyle}>
      <Row>
        {/* 左侧：图片展示区域 */}
        <Col xs={24} md={12} className="h-screen">
          <ProductImageGallery 
            product={product}
            locale={locale}
          />
        </Col>
        
        {/* 右侧：产品信息和购买区域 */}
        <Col xs={24} md={12} className="h-screen overflow-y-auto">
          <ProductPurchasePanel 
            product={product}
            locale={locale}
          />
        </Col>
      </Row>
    </div>
  );
}