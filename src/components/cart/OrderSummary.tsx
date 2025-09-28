"use client";
import { Card, Typography, Statistic, Button, Divider, Space } from 'antd';
import { useTranslations } from 'next-intl';
import './OrderSummary.css';

const { Title, Text } = Typography;

interface OrderSummaryProps {
  totalAmount: number;
  itemCount: number;
  locale: string;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

/**
 * 订单摘要组件
 * 显示订单总价和结算按钮
 */
export default function OrderSummary({
  totalAmount,
  itemCount,
  locale,
  onCheckout,
  isCheckingOut = false
}: OrderSummaryProps) {
  const cartT = useTranslations('cart');
  
  // 计算税费和运费（示例）
  const tax = totalAmount * 0.05;
  const shipping = totalAmount > 100 ? 0 : 10;
  const orderTotal = totalAmount + tax + shipping;
  
  return (
    <Card
      title={
        <Title level={4} className="!m-0">
          {cartT('orderSummary')}
        </Title>
      }
      className="sticky top-4"
    >
      <Space direction="vertical" size="middle" className="w-full">
        <div className="flex justify-between">
          <Text>{cartT('subtotal')} ({itemCount} {itemCount === 1 ? cartT('item') : cartT('items')})</Text>
          <Text>${totalAmount.toFixed(2)}</Text>
        </div>
        
        <div className="flex justify-between">
          <Text>{cartT('tax')}</Text>
          <Text>${tax.toFixed(2)}</Text>
        </div>
        
        <div className="flex justify-between">
          <Text>{cartT('shipping')}</Text>
          {shipping === 0 ? (
            <Text type="success">{cartT('free')}</Text>
          ) : (
            <Text>${shipping.toFixed(2)}</Text>
          )}
        </div>
        
        <Divider className="!my-2" />
        
        <div className="flex justify-between">
          <Statistic 
            title={<strong>{cartT('total')}</strong>}
            value={orderTotal} 
            precision={2}
            prefix="$"
            className="!text-lg"
          />
        </div>
        
        <Button
          type="primary"
          size="large"
          block
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={onCheckout}
          loading={isCheckingOut}
        >
          {cartT('proceedToCheckout')}
        </Button>
        
        {shipping === 0 && (
          <Text type="success" className="text-center block">
            {cartT('qualifiedFreeShipping')}
          </Text>
        )}
        {shipping > 0 && (
          <Text type="secondary" className="text-center block">
            {cartT('freeShippingMessage')} ${(100 - totalAmount).toFixed(2)} {cartT('more')}
          </Text>
        )}
      </Space>
    </Card>
  );
}