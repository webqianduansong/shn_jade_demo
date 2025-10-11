"use client";
import { useState } from 'react';
import { Typography, Rate, Space, Divider, Button, Tag } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNotification } from '@/components/Notification';

const { Title, Text } = Typography;

// 默认尺寸选项（当后端未提供型号时）
const SIZE_OPTIONS = [
  { value: "1/2_single", label: "1/2\" Single" },
  { value: "1_per_lb", label: "1\" Per lb" },
  { value: "1_single", label: "1\" Single" },
  { value: "1/2_per_lb", label: "1/2\" Per lb" },
];

interface ProductPurchasePanelProps {
  product: {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    price: number;
    image?: unknown;
    images?: string[];
    sku?: string | null;
    rating?: number | null;
    reviewsCount?: number | null;
    models?: string[];
  };
  locale: string;
}

export default function ProductPurchasePanel({ product, locale }: ProductPurchasePanelProps) {
  const { showNotification, NotificationContainer } = useNotification();
  const sizeOptions = (product.models && product.models.length)
    ? product.models.map((m, idx) => ({ value: `m_${idx}`, label: m }))
    : SIZE_OPTIONS;
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0].value);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const isZh = locale === 'zh';
  
  // 处理添加到购物车
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id, 
          quantity: 1,
          options: { size: selectedSize }
        }),
      });
      
      if (response.ok) {
        showNotification(
          isZh ? '已添加到购物车' : 'Added to cart',
          'success'
        );
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification(
        isZh ? '添加失败，请重试' : 'Failed to add, please try again',
        'error'
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div style={{ 
      padding: '48px 32px',
      backgroundColor: 'white',
      height: '100vh',
      overflow: 'auto'
    }}>
      {/* 产品标题 */}
      <Title level={1} style={{ 
        fontSize: '36px',
        fontWeight: 600,
        marginBottom: '24px',
        color: '#000',
        lineHeight: 1.2
      }}>
        {product.name}
      </Title>
      
      {/* 评分和评论 */}
      <Space align="center" style={{ marginBottom: '8px' }}>
        <Rate disabled value={Number(product.rating || 0)} style={{ fontSize: '16px', color: '#52c41a' }} />
        <Text style={{ fontSize: '14px', color: '#666' }}>{Number(product.reviewsCount || 0)} reviews</Text>
      </Space>
      
      {/* SKU */}
      <Text style={{ 
        display: 'block',
        fontSize: '14px',
        color: '#999',
        marginBottom: '32px'
      }}>
        {product.sku ? `SKU: ${product.sku}` : ''}
      </Text>
      
      {/* 尺寸选择 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={4} style={{ 
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '12px',
          color: '#000'
        }}>
          Nugget sizes
        </Title>
        <Space wrap size={[8, 8]}>
          {sizeOptions.map(option => (
            <Button
              key={option.value}
              onClick={() => setSelectedSize(option.value)}
              style={{
                borderColor: selectedSize === option.value ? '#000' : '#d9d9d9',
                backgroundColor: 'white',
                color: selectedSize === option.value ? '#000' : '#666',
                fontWeight: selectedSize === option.value ? 600 : 400,
                borderWidth: selectedSize === option.value ? '2px' : '1px',
                height: '40px',
                padding: '0 16px'
              }}
            >
              {option.label}
            </Button>
          ))}
        </Space>
      </div>
      
      {/* 价格 */}
      <div style={{ marginBottom: '16px' }}>
        <Title level={4} style={{ 
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '8px',
          color: '#000'
        }}>
          Price
        </Title>
        <Title level={2} style={{ 
          fontSize: '24px',
          fontWeight: 600,
          margin: 0,
          color: '#000'
        }}>
          ${product.price.toFixed(2)}
        </Title>
      </div>
      
      {/* Shop Pay信息 */}
      <div style={{ marginBottom: '8px' }}>
        <Text style={{ fontSize: '14px', color: '#666' }}>
          Pay over time for orders over <strong>$35.00</strong> with{' '}
          <Tag color="purple" style={{ margin: 0 }}>shop</Tag>{' '}
          <Button type="link" style={{ padding: 0, height: 'auto', fontSize: '14px' }}>
            Learn more
          </Button>
        </Text>
      </div>
      
      {/* 运费信息 */}
      <div style={{ marginBottom: '32px' }}>
        <Button type="link" style={{ 
          padding: 0,
          fontSize: '14px',
          color: '#666',
          textDecoration: 'underline'
        }}>
          Shipping
        </Button>
        <Text style={{ fontSize: '14px', color: '#666', marginLeft: '4px' }}>
          calculated at checkout.
        </Text>
      </div>
      
      {/* 安全支付 */}
      <Space align="center" style={{ marginBottom: '32px' }}>
        <LockOutlined style={{ fontSize: '16px', color: '#666' }} />
        <Text style={{ fontSize: '14px', color: '#666' }}>
          Secure payments
        </Text>
      </Space>
      
      {/* 添加到购物车按钮 */}
      <Button
        onClick={handleAddToCart}
        loading={isAddingToCart}
        style={{
          width: '100%',
          height: '48px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: 'white',
          borderColor: '#000',
          borderWidth: '2px',
          color: '#000',
          marginBottom: '12px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#000';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.color = '#000';
        }}
      >
        Add to cart
      </Button>
      
      {/* PayPal按钮 */}
      <Button
        style={{
          width: '100%',
          height: '48px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#ffc439',
          borderColor: '#ffc439',
          color: '#003087',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        Pay with <strong style={{ marginLeft: '4px' }}>PayPal</strong>
      </Button>
      
      {/* 更多支付选项 */}
      <Button 
        type="link" 
        style={{ 
          width: '100%',
          fontSize: '14px',
          color: '#666',
          textDecoration: 'underline',
          padding: 0,
          height: 'auto'
        }}
      >
        More payment options
      </Button>
      
      <NotificationContainer />
    </div>
  );
}
