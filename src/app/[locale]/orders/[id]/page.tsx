"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Steps, Descriptions, Button, Tag, Spin, Modal, message, Divider } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, TruckOutlined, ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiGet, apiPut } from '@/lib/apiClient';
import '../orders.css';

interface Order {
  id: string;
  orderNo: string;
  status: string;
  shippingAddress: any;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  shippingMethod: string;
  paymentMethod: string;
  remark?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  shippingCompany?: string;
  items: {
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrderDetailPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = (params?.locale as string) || 'zh';
  const id = params?.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    const result = await apiGet(`/api/orders/${id}`);
    
    if (result.success && result.data) {
      setOrder(result.data.order);
    } else {
      message.error(locale === 'zh' ? '订单不存在' : 'Order not found');
      router.push(`/${locale}/profile?tab=orders`);
    }
    setLoading(false);
  };

  const handleCancelOrder = () => {
    Modal.confirm({
      title: locale === 'zh' ? '确认取消订单？' : 'Cancel Order?',
      content: locale === 'zh' ? '取消后无法恢复' : 'This action cannot be undone',
      okText: locale === 'zh' ? '确认取消' : 'Confirm',
      cancelText: locale === 'zh' ? '返回' : 'Back',
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading(true);
        const result = await apiPut(`/api/orders/${id}`, { action: 'cancel' });
        if (result.success) {
          message.success(locale === 'zh' ? '订单已取消' : 'Order cancelled');
          loadOrder();
        }
        setActionLoading(false);
      }
    });
  };

  const handleConfirmReceive = () => {
    Modal.confirm({
      title: locale === 'zh' ? '确认收货？' : 'Confirm Receipt?',
      content: locale === 'zh' ? '请确认已收到商品' : 'Please confirm you have received the goods',
      okText: locale === 'zh' ? '确认收货' : 'Confirm',
      cancelText: locale === 'zh' ? '返回' : 'Back',
      onOk: async () => {
        setActionLoading(true);
        const result = await apiPut(`/api/orders/${id}`, { action: 'confirm' });
        if (result.success) {
          message.success(locale === 'zh' ? '确认收货成功' : 'Receipt confirmed');
          loadOrder();
        }
        setActionLoading(false);
      }
    });
  };

  const getStatusStep = (status: string) => {
    const statusMap: Record<string, number> = {
      'PENDING': 0,
      'PAID': 1,
      'SHIPPED': 2,
      'DELIVERED': 3,
      'CANCELLED': -1
    };
    return statusMap[status] ?? 0;
  };

  const formatAddress = (address: any) => {
    if (!address) return '';
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.district,
      address.city,
      address.state,
      address.country,
      address.postalCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 160px)' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载中...' : 'Loading...'} />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="orders-page-container">
      <div className="orders-content">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '16px', color: '#2d5a3d' }}
        >
          {locale === 'zh' ? '返回' : 'Back'}
        </Button>

        <h1 className="orders-title">
          <ShoppingOutlined style={{ marginRight: '12px' }} />
          {locale === 'zh' ? '订单详情' : 'Order Details'}
        </h1>

        {/* 订单状态进度 */}
        {order.status !== 'CANCELLED' && (
          <Card className="status-card" style={{ marginBottom: '20px' }}>
            <Steps
              current={currentStep}
              items={[
                {
                  title: locale === 'zh' ? '已下单' : 'Ordered',
                  description: order.createdAt ? new Date(order.createdAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US') : '',
                  icon: <ClockCircleOutlined />
                },
                {
                  title: locale === 'zh' ? '已支付' : 'Paid',
                  description: order.paidAt ? new Date(order.paidAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US') : '',
                  icon: <CheckCircleOutlined />
                },
                {
                  title: locale === 'zh' ? '已发货' : 'Shipped',
                  description: order.shippedAt ? new Date(order.shippedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US') : '',
                  icon: <TruckOutlined />
                },
                {
                  title: locale === 'zh' ? '已完成' : 'Delivered',
                  description: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US') : '',
                  icon: <CheckCircleOutlined />
                }
              ]}
            />
          </Card>
        )}

        {/* 物流信息 */}
        {order.trackingNumber && (
          <Card 
            className="info-card" 
            style={{ marginBottom: '20px' }}
            title={
              <span>
                <TruckOutlined style={{ marginRight: '8px', color: '#2d5a3d' }} />
                {locale === 'zh' ? '物流信息' : 'Shipping Info'}
              </span>
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label={locale === 'zh' ? '物流公司' : 'Carrier'}>
                {order.shippingCompany}
              </Descriptions.Item>
              <Descriptions.Item label={locale === 'zh' ? '运单号' : 'Tracking Number'}>
                {order.trackingNumber}
              </Descriptions.Item>
            </Descriptions>
            <Button 
              type="link" 
              onClick={() => router.push(`/${locale}/orders/${id}/tracking`)}
              style={{ padding: 0, marginTop: '8px' }}
            >
              {locale === 'zh' ? '查看物流详情 →' : 'View Tracking Details →'}
            </Button>
          </Card>
        )}

        {/* 收货信息 */}
        <Card 
          className="info-card" 
          style={{ marginBottom: '20px' }}
          title={
            <span>
              <EnvironmentOutlined style={{ marginRight: '8px', color: '#2d5a3d' }} />
              {locale === 'zh' ? '收货信息' : 'Shipping Address'}
            </span>
          }
        >
          <Descriptions column={1}>
            <Descriptions.Item label={locale === 'zh' ? '收件人' : 'Recipient'}>
              {order.shippingAddress?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '手机号' : 'Phone'}>
              {order.shippingAddress?.phone}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '收货地址' : 'Address'}>
              {formatAddress(order.shippingAddress)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 商品信息 */}
        <Card 
          className="info-card"
          title={
            <span>
              <ShoppingOutlined style={{ marginRight: '8px', color: '#2d5a3d' }} />
              {locale === 'zh' ? '商品信息' : 'Products'}
            </span>
          }
        >
          <div className="order-products">
            {order.items.map((item, index) => (
              <div key={index} className="order-product">
                <img 
                  src={item.productImage || '/placeholder.png'} 
                  alt={item.productName}
                  className="product-image"
                />
                <div className="product-info">
                  <div className="product-name">{item.productName}</div>
                  <div className="product-quantity">x{item.quantity}</div>
                </div>
                <div className="product-price">
                  ¥{((item.price * item.quantity) / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <Divider />

          <div className="order-summary">
            <div className="summary-row">
              <span>{locale === 'zh' ? '商品小计' : 'Subtotal'}</span>
              <span>¥{(order.subtotalCents / 100).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>{locale === 'zh' ? '运费' : 'Shipping'}</span>
              <span>¥{(order.shippingCents / 100).toFixed(2)}</span>
            </div>
            {order.discountCents > 0 && (
              <div className="summary-row discount">
                <span>{locale === 'zh' ? '优惠' : 'Discount'}</span>
                <span>-¥{(order.discountCents / 100).toFixed(2)}</span>
              </div>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div className="summary-total">
              <span>{locale === 'zh' ? '实付款' : 'Total'}</span>
              <span className="total-amount">¥{(order.totalCents / 100).toFixed(2)}</span>
            </div>
          </div>

          <Divider />

          <Descriptions column={2} size="small">
            <Descriptions.Item label={locale === 'zh' ? '订单号' : 'Order No'}>
              {order.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '下单时间' : 'Order Time'}>
              {new Date(order.createdAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '配送方式' : 'Shipping Method'}>
              {order.shippingMethod}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '支付方式' : 'Payment Method'}>
              {order.paymentMethod}
            </Descriptions.Item>
            {order.remark && (
              <Descriptions.Item label={locale === 'zh' ? '订单备注' : 'Remark'} span={2}>
                {order.remark}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* 操作按钮 */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {order.status === 'PENDING' && (
              <Button danger onClick={handleCancelOrder} loading={actionLoading}>
                {locale === 'zh' ? '取消订单' : 'Cancel Order'}
              </Button>
            )}
            {order.status === 'SHIPPED' && (
              <Button type="primary" onClick={handleConfirmReceive} loading={actionLoading}>
                {locale === 'zh' ? '确认收货' : 'Confirm Receipt'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

