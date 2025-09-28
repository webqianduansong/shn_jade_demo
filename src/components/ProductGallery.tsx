"use client";
import { useState } from 'react';
import { Product } from '@/data/products';
import { resolveSrc } from '@/lib/imageUtils';

interface ProductGalleryProps {
  product: Product;
  locale: string;
}

export default function ProductGallery({ product, locale }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 模拟多张商品图片
  const productImages = [
    { src: resolveSrc(product.image), alt: product.name, type: 'main' },
    { src: resolveSrc(product.image), alt: `${product.name} - Model wearing`, type: 'model' },
    { src: resolveSrc(product.image), alt: `${product.name} - Multiple view`, type: 'multiple' },
    { src: resolveSrc(product.image), alt: `${product.name} - Packaging`, type: 'packaging' },
    { src: resolveSrc(product.image), alt: `${product.name} - Certificate`, type: 'certificate' },
  ];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative group">
        <img
          src={productImages[currentImageIndex].src}
          alt={productImages[currentImageIndex].alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : productImages.length - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button
          onClick={() => setCurrentImageIndex((prev) => prev < productImages.length - 1 ? prev + 1 : 0)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-5 gap-2">
        {productImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
              currentImageIndex === index 
                ? 'border-emerald-500 ring-2 ring-emerald-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      
      {/* Image Indicators */}
      <div className="flex justify-center space-x-2">
        {productImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentImageIndex === index ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
