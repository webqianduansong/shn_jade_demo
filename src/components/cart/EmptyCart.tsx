"use client";
import { Empty, Button, Typography, Space } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import './EmptyCart.css';

const { Title, Text } = Typography;

interface EmptyCartProps {
  locale: string;
}

/**
 * 空购物车状态组件
 */
export default function EmptyCart({ locale }: EmptyCartProps) {
  const router = useRouter();
  const cartT = useTranslations('cart');
  
  return (
    <div className="empty-cart-container">
      <Space direction="vertical" size="large" className="w-full">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: 120 }}
          description={false}
        />
        
        <Title level={3}>
          {locale === 'zh' ? '购物车为空' : 'Your cart is empty'}
        </Title>
        
        <Text type="secondary" className="max-w-md mx-auto block">
          {cartT('emptyCartMessage')}
        </Text>
        
        <div className="mt-8">
          <Button 
            type="primary" 
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => router.push(`/${locale}`)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {cartT('continueShopping')}
          </Button>
        </div>
      </Space>
    </div>
  );
}