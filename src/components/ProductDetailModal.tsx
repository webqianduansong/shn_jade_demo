"use client";
import { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductImageGallery from './product/ProductImageGallery';
import ProductInfo from './product/ProductInfo';
import ProductDescription from './product/ProductDescription';
import products from '@/data/products';

interface ProductDetailModalProps {
  productId: string | null;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  productId,
  locale,
  isOpen,
  onClose
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (productId && isOpen) {
      setLoading(true);
      // 模拟异步加载产品数据
      setTimeout(() => {
        const foundProduct = products.find(p => p.id === productId);
        setProduct(foundProduct);
        setLoading(false);
      }, 300);
    }
  }, [productId, isOpen]);

  const handleClose = () => {
    setProduct(null);
    onClose();
    // 更新URL但不刷新页面
    router.push(`/${locale}`, { scroll: false });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width="90vw"
      style={{ maxWidth: '1200px', top: '20px' }}
      className="product-detail-modal"
      destroyOnClose
      maskClosable={true}
    >
      <div className="relative">
        {/* 关闭按钮 */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          className="absolute top-0 right-0 z-10 bg-white shadow-lg"
          size="large"
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Spin size="large" />
          </div>
        ) : product ? (
          <div className="product-detail-content">
            {/* 产品图片画廊 */}
            <div className="mb-8">
              <ProductImageGallery product={product} />
            </div>
            
            {/* 产品信息 */}
            <div className="mb-8">
              <ProductInfo product={product} locale={locale} />
            </div>
            
            {/* 产品描述 */}
            <div>
              <ProductDescription product={product} locale={locale} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">产品未找到</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
