"use client";
import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import DynamicText from './DynamicText';
import Image from 'next/image';
import lb1 from  '@/images/lb1.png';
import lb2 from  '@/images/lb2.png';
import lb3 from  '@/images/lb3.png';

/**
 * 首页轮播图组件
 * 展示网站的主要宣传图片和内容
 */
export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0); // 当前显示的轮播图索引
  const t = useTranslations('hero'); // 轮播图相关翻译

  // 轮播图数据配置
  const slides = [
    {
      id: 1,
      title: t('slide1.title'),
      subtitle: t('slide1.subtitle'),
      image: lb1,
      cta: t('slide1.cta')
    },
    {
      id: 2,
      title: t('slide2.title'),
      subtitle: t('slide2.subtitle'),
      image: lb2,
      cta: t('slide2.cta')
    },
    {
      id: 3,
      title: t('slide3.title'),
      subtitle: t('slide3.subtitle'),
      image: lb3,
      cta: t('slide3.cta')
    }
  ];

  // 自动轮播效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-section">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${
            index === currentSlide ? 'active' : ''
          }`}
        >
          {/* 背景图片 */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="hero-image"
              priority={index === 0}
            />
            {/* 遮罩层 */}
            <div className="hero-overlay"></div>
          </div>
          
          {/* 内容区域 */}
          <div className="hero-content">
            <h1 className="hero-title">
              <DynamicText fallback={slide.title}>
                {slide.title}
              </DynamicText>
            </h1>
            <p className="hero-subtitle">
              <DynamicText fallback={slide.subtitle}>
                {slide.subtitle}
              </DynamicText>
            </p>
            <button className="hero-cta">
              <DynamicText fallback={slide.cta}>
                {slide.cta}
              </DynamicText>
            </button>
          </div>
        </div>
      ))}
      
      {/* 轮播指示器 */}
      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`hero-dot ${
              index === currentSlide ? 'active' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
