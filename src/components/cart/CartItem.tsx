"use client";
import { useState } from 'react';
import { 
  Row, 
  Col, 
  Space, 
  Button, 
  InputNumber, 
  Typography, 
  Image, 
  Card,
  Spin
} from 'antd';
import { 
  MinusOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { resolveSrc } from '@/lib/imageUtils';
import { useTranslations } from 'next-intl';
import { CartItemWithProduct, Product } from '@/types';
import './CartItem.css';

const { Title, Text, Paragraph } = Typography;

// 使用中央定义的类型
export type CartItemType = CartItemWithProduct;

interface CartItemProps {
  item: CartItemType;
  locale: string;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
  isUpdating: boolean;
}

/**
 * 购物车商品项组件
 */
export default function CartItem({ 
  item, 
  locale, 
  onUpdateQuantity, 
  onRemove,
  isUpdating
}: CartItemProps) {
  const cartT = useTranslations('cart');
  
  return (
    <Card size="small" className="cart-item-card">
      <Row gutter={[16, 16]} align="middle">
        {/* 商品图片 */}
        <Col xs={24} sm={6} md={4}>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={resolveSrc(item.product.image)}
              alt={item.product.name}
              className="w-full h-full object-cover"
              preview={{
                mask: <ShoppingCartOutlined />,
              }}
            />
          </div>
        </Col>
        
        {/* 商品信息 */}
        <Col xs={24} sm={18} md={20}>
          <Row justify="space-between" align="top">
            <Col xs={24} md={16}>
              <Space direction="vertical" size="small" className="w-full">
                <Title level={4} className="!mb-1">
                  {locale === 'zh' ? item.product.name : item.product.nameEn}
                </Title>
                <Paragraph 
                  ellipsis={{ rows: 2 }} 
                  className="!mb-2 text-gray-600"
                >
                  {locale === 'zh' ? item.product.description : item.product.descriptionEn}
                </Paragraph>
                
                {/* 数量选择器 */}
                <Space align="center">
                  <Text strong>{cartT('quantity')}:</Text>
                  <Space.Compact>
                    <Button 
                      icon={<MinusOutlined />}
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={isUpdating || item.quantity <= 1}
                    />
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(value) => value && onUpdateQuantity(item.productId, value)}
                      disabled={isUpdating}
                      className="w-16 text-center"
                    />
                    <Button 
                      icon={<PlusOutlined />}
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={isUpdating}
                    />
                  </Space.Compact>
                </Space>
              </Space>
            </Col>
            
            {/* 价格和删除按钮 */}
            <Col xs={24} md={8}>
              <Space direction="vertical" align="end" className="w-full">
                <Title level={3} className="!mb-0 text-emerald-600">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Title>
                <Text type="secondary" className="text-sm">
                  ${item.product.price.toFixed(2)} × {item.quantity}
                </Text>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => onRemove(item.productId)}
                  disabled={isUpdating}
                  loading={isUpdating}
                >
                  {cartT('remove')}
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}
