"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Tabs, Empty, Spin, Tag, Button, Steps } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiGet } from '@/lib/apiClient';
import './orders.css';

interface Order {
  id: string;
  orderNo: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: {
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrdersPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    const status = activeTab === 'all' ? '' : activeTab;
    const result = await apiGet(`/api/orders${status ? `?status=${status}` : ''}`);
    
    if (result.success && result.data) {
      setOrders(result.data.orders || []);
    }
    setLoading(false);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: any }> = {
      PENDING: { 
        color: 'orange', 
        text: locale === 'zh' ? '待支付' : 'Pending Payment',
        icon: <ClockCircleOutlined />
      },
      PAID: { 
        color: 'blue', 
        text: locale === 'zh' ? '已支付' : 'Paid',
        icon: <CheckCircleOutlined />
      },
      SHIPPED: { 
        color: 'cyan', 
        text: locale === 'zh' ? '已发货' : 'Shipped',
        icon: <CheckCircleOutlined />
      },
      DELIVERED: { 
        color: 'green', 
        text: locale === 'zh' ? '已完成' : 'Delivered',
        icon: <CheckCircleOutlined />
      },
      CANCELLED: { 
        color: 'red', 
        text: locale === 'zh' ? '已取消' : 'Cancelled',
        icon: <CloseCircleOutlined />
      },
    };
    return statusMap[status] || { color: 'default', text: status, icon: null };
  };

  const tabItems = [
    {
      key: 'all',
      label: locale === 'zh' ? '全部订单' : 'All Orders'
    },
    {
      key: 'pending',
      label: locale === 'zh' ? '待支付' : 'Pending'
    },
    {
      key: 'paid',
      label: locale === 'zh' ? '待发货' : 'To Ship'
    },
    {
      key: 'shipped',
      label: locale === 'zh' ? '待收货' : 'To Receive'
    },
    {
      key: 'delivered',
      label: locale === 'zh' ? '已完成' : 'Completed'
    },
  ];

  return (
    <div className="orders-page-container">
      <div className="orders-content">
        <h1 className="orders-title">
          <ShoppingOutlined style={{ marginRight: '12px' }} />
          {locale === 'zh' ? '我的订单' : 'My Orders'}
        </h1>

        <Card className="orders-card">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />

          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip={locale === 'zh' ? '加载中...' : 'Loading...'} />
            </div>
          ) : orders.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={locale === 'zh' ? '暂无订单' : 'No orders yet'}
            >
              <Button type="primary" onClick={() => router.push(`/${locale}`)}>
                {locale === 'zh' ? '去购物' : 'Start Shopping'}
              </Button>
            </Empty>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <Card
                    key={order.id}
                    className="order-item"
                    onClick={() => router.push(`/${locale}/orders/${order.id}`)}
                  >
                    {/* 订单头部 */}
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-no">
                          {locale === 'zh' ? '订单号：' : 'Order No: '}{order.orderNo}
                        </span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                        </span>
                      </div>
                      <Tag color={statusInfo.color} icon={statusInfo.icon} className="order-status">
                        {statusInfo.text}
                      </Tag>
                    </div>

                    {/* 订单商品 */}
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

                    {/* 订单底部 */}
                    <div className="order-footer">
                      <div className="order-total">
                        <span className="total-label">
                          {locale === 'zh' ? '实付款：' : 'Total: '}
                        </span>
                        <span className="total-amount">
                          ¥{(order.totalCents / 100).toFixed(2)}
                        </span>
                      </div>
                      <Button type="primary" size="small">
                        {locale === 'zh' ? '查看详情' : 'View Details'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

