"use client";
import { Card, Space, Tag, InputNumber, Button, Alert, Row, Col } from 'antd';
import { 
  CheckCircleOutlined, 
  ShareAltOutlined, 
  HeartOutlined, 
  ShoppingCartOutlined 
} from '@ant-design/icons';
import { Rate } from 'antd';
import ProductDetailClient from '../ProductDetailClient';

/**
 * 产品信息组件
 * 包含产品标题、价格、库存状态、购买选项等信息
 */
interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    price: number;
    image: unknown;
  };
  locale: string;
}

export default function ProductInfo({ product, locale }: ProductInfoProps) {
  return (
    <div className="space-y-8">
      {/* 产品标题 - 参考GRANSKY样式 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 leading-tight">
          {locale === 'zh' ? product.name : product.nameEn}
        </h1>
        
        {/* 折扣横幅 - 参考GRANSKY样式 */}
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium mb-6 inline-block">
          {locale === 'zh' ? '结账时享受20%折扣' : '20% OFF Jade Jewelry at Checkout'}
        </div>
      </div>
      
      {/* 价格显示 - 参考GRANSKY样式 */}
      <div>
        <div className="text-3xl font-semibold text-gray-900 mb-2">
          ${product.price} USD
        </div>
      </div>

      {/* 数量选择 - 参考GRANSKY样式 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          {locale === 'zh' ? '数量' : 'Quantity'}
        </label>
        <div className="flex items-center space-x-3">
          <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50">
            <span className="text-gray-600">-</span>
          </button>
          <span className="w-12 text-center font-medium">1</span>
          <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50">
            <span className="text-gray-600">+</span>
          </button>
        </div>
      </div>
      
      {/* 购买按钮组 - 参考GRANSKY样式 */}
      <div className="space-y-4">
        <ProductDetailClient 
          product={product}
          locale={locale}
        />
        
        <Button 
          type="primary" 
          size="large"
          className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 border-0"
        >
          {locale === 'zh' ? '通过Shop购买' : 'Buy with shop'}
        </Button>
        
        <a href="#" className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
          {locale === 'zh' ? '更多支付选项' : 'More payment options'}
        </a>
      </div>
      
      {/* 取货信息 - 参考GRANSKY样式 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <CheckCircleOutlined className="text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            {locale === 'zh' ? '可在墨尔本广场33号皇后路中心取货' : 'Pickup available at Melbourne Plaza, 33 Queen\'s Road Central'}
          </span>
        </div>
        <div className="text-sm text-gray-600 ml-6">
          {locale === 'zh' ? '通常2-4天内准备好' : 'Usually ready in 2-4 days'}
        </div>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline ml-6">
          {locale === 'zh' ? '查看商店信息' : 'View store information'}
        </a>
      </div>
      
      {/* 分享选项 - 参考GRANSKY样式 */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          {locale === 'zh' ? '分享' : 'Share'}
        </span>
        <div className="flex space-x-2">
          <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </button>
          <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
