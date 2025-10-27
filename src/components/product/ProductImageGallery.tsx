"use client";
import { useState, useEffect, useRef } from 'react';
import { Image, Button, Card } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { resolveSrc } from '@/lib/imageUtils';

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductImageGalleryProps {
  product: {
    id: string;
    name: string;
    nameEn: string;
    image: unknown;
    images?: string[];
  };
  locale: string;
}

export default function ProductImageGallery({ product, locale }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  
  // 使用接口返回的真实商品图片
  const productImages: ProductImage[] = (product.images && product.images.length > 0)
    ? product.images.map((imgUrl, index) => ({
        src: resolveSrc(imgUrl),
        alt: `${locale === 'zh' ? product.name : product.nameEn}${index > 0 ? ` - 视图${index + 1}` : ''}`
      }))
    : [{ src: resolveSrc(product.image), alt: locale === 'zh' ? product.name : product.nameEn }];

  // 处理图片切换
  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  // 点击缩略图切换主图
  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    
    // 滚动到选中的缩略图
    if (thumbnailContainerRef.current) {
      const thumbnail = thumbnailContainerRef.current.children[index] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white'
    }}>
      {/* 主图显示区域 */}
      <div 
        style={{ 
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}
        className="image-gallery-container"
      >
        <div style={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image
            src={productImages[currentIndex].src}
            alt={productImages[currentIndex].alt}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            preview={false}
          />
        </div>
        
        {/* 左侧导航按钮 - 只有多张图片时显示 */}
        {productImages.length > 1 && (
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={prevImage}
            className="nav-button-hover"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: 'none',
              fontSize: '18px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.color = '#666';
            }}
          />
        )}
        
        {/* 右侧导航按钮 - 只有多张图片时显示 */}
        {productImages.length > 1 && (
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={nextImage}
            className="nav-button-hover"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: 'none',
              fontSize: '18px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.color = '#666';
            }}
          />
        )}
      </div>
      
      {/* 底部缩略图滚动区域 - 只有多张图片时显示 */}
      {productImages.length > 1 && (
        <div style={{ 
          padding: '20px',
          backgroundColor: 'white'
        }}>
          <div 
            ref={thumbnailContainerRef}
            className="thumbnail-scroll"
          >
            {productImages.map((image, index) => (
              <Card
                key={index}
                onClick={() => handleThumbnailClick(index)}
                hoverable
                style={{
                  flexShrink: 0,
                  width: '80px',
                  height: '80px',
                  border: currentIndex === index ? '2px solid #000' : '2px solid transparent',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Image
                  src={image.src}
                  alt={`缩略图 ${index + 1}`}
                  preview={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}