"use client";
import { Space, Button, Row, Col } from 'antd';
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

/**
 * 购物车页面头部组件
 * 显示购物车标题、商品数量和清空购物车功能
 */
interface CartHeaderProps {
  itemCount: number;
  onClearCart: () => void;
  locale: string;
}

export default function CartHeader({ itemCount, onClearCart, locale }: CartHeaderProps) {
  const cartT = useTranslations('cart');

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <h1 className="text-3xl font-bold text-gray-900 mb-0">
                <ShoppingCartOutlined className="mr-3" />
                {cartT('title')}
              </h1>
              <p className="text-lg text-gray-600">
                {itemCount > 0 
                  ? `${itemCount} ${itemCount > 1 ? cartT('itemCountPlural') : cartT('itemCount')} ${cartT('inYourCart')}`
                  : cartT('emptyDesc')
                }
              </p>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <Space>
                <CheckCircleOutlined className="text-green-600 text-xl" />
                <span className="font-semibold text-green-600">
                  {cartT('freeExpressShipping')}
                </span>
              </Space>
              {itemCount > 0 && (
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={onClearCart}
                >
                  {cartT('clearCart')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
}
