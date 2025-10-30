"use client";
import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/hero-carousel.css';

interface Banner {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
}

/**
 * 首页轮播图组件
 * 从 API 动态获取轮播图数据
 */
export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 获取轮播图数据
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        const data = await response.json();
        if (data.success && data.banners) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error('获取轮播图失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // 自动轮播效果
  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  // 加载中状态
  if (loading) {
    return (
      <div className="hero-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 没有轮播图数据 - 不显示轮播图区域
  if (banners.length === 0) {
    return null;
  }

  // 包装单个轮播图内容
  const renderSlideContent = (banner: Banner, index: number) => (
    <div
      key={banner.id}
      className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
    >
      {/* 背景图片容器 */}
      <div className="absolute inset-0" style={{ background: '#f8f9fa' }}>
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          className="hero-image"
          priority={index === 0}
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
        {/* 遮罩层 */}
        <div className="hero-overlay"></div>
      </div>

      {/* 内容区域 */}
      <div className="hero-content">
        <h1 className="hero-title">{banner.title}</h1>
        {banner.description && (
          <p className="hero-subtitle">{banner.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="hero-section">
      {/* 渲染所有轮播图 */}
      {banners.map((banner, index) => {
        // 如果有跳转链接，包裹在 Link 中
        if (banner.linkUrl) {
          return (
            <Link href={banner.linkUrl} key={banner.id}>
              {renderSlideContent(banner, index)}
            </Link>
          );
        }
        // 没有跳转链接，直接渲染
        return renderSlideContent(banner, index);
      })}

      {/* 轮播指示器 */}
      {banners.length > 1 && (
        <div className="hero-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              aria-label={`跳转到第 ${index + 1} 张轮播图`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
