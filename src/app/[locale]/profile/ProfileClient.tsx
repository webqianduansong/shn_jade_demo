"use client";
import { useState, useEffect } from 'react';
import { Card, Tabs, Descriptions, Table, Tag, Empty, Spin, Avatar, Space, Button } from 'antd';
import { UserOutlined, ShoppingOutlined, SettingOutlined, HeartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './profile.css';

interface User {
  id?: string;
  email: string;
  name?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface ProfileClientProps {
  locale: string;
  user: User;
}

export default function ProfileClient({ locale, user }: ProfileClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: locale === 'zh' ? '待支付' : 'Pending' },
      paid: { color: 'green', text: locale === 'zh' ? '已支付' : 'Paid' },
      shipped: { color: 'blue', text: locale === 'zh' ? '已发货' : 'Shipped' },
      delivered: { color: 'success', text: locale === 'zh' ? '已送达' : 'Delivered' },
      cancelled: { color: 'red', text: locale === 'zh' ? '已取消' : 'Cancelled' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Order> = [
    {
      title: locale === 'zh' ? '订单号' : 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => (
        <span className="order-id">#{id.slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      title: locale === 'zh' ? '商品信息' : 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => (
        <div className="order-items">
          {items.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.productName}</span>
              <span className="item-quantity">×{item.quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: locale === 'zh' ? '金额' : 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => (
        <span className="order-amount">${(amount / 100).toFixed(2)}</span>
      ),
    },
    {
      title: locale === 'zh' ? '状态' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: locale === 'zh' ? '下单时间' : 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US'),
    },
  ];

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <UserOutlined />
          {locale === 'zh' ? '个人信息' : 'Profile'}
        </span>
      ),
      children: (
        <Card className="info-card" bordered={false}>
          <div className="user-header">
            <Avatar size={80} icon={<UserOutlined />} className="user-avatar" />
            <div className="user-info">
              <h2 className="user-name">{user.name || (locale === 'zh' ? '玉石爱好者' : 'Jade Lover')}</h2>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <Descriptions column={1} className="user-details">
            <Descriptions.Item label={locale === 'zh' ? '用户ID' : 'User ID'}>
              {user.id ? user.id.slice(0, 8).toUpperCase() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '注册邮箱' : 'Email'}>
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '会员等级' : 'Member Level'}>
              <Tag color="gold">{locale === 'zh' ? '普通会员' : 'Regular Member'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={locale === 'zh' ? '账户状态' : 'Status'}>
              <Tag color="green">{locale === 'zh' ? '正常' : 'Active'}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'orders',
      label: (
        <span>
          <ShoppingOutlined />
          {locale === 'zh' ? '我的订单' : 'My Orders'}
        </span>
      ),
      children: (
        <Card className="orders-card" bordered={false}>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : orders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => locale === 'zh' ? `共 ${total} 条` : `Total ${total} items`,
              }}
              className="orders-table"
            />
          ) : (
            <Empty
              description={locale === 'zh' ? '暂无订单' : 'No orders yet'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" href={`/${locale}/products`}>
                {locale === 'zh' ? '去购物' : 'Start Shopping'}
              </Button>
            </Empty>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1 className="profile-title">
            {locale === 'zh' ? '个人中心' : 'My Account'}
          </h1>
          <p className="profile-subtitle">
            {locale === 'zh' ? '管理您的个人信息和订单' : 'Manage your profile and orders'}
          </p>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="profile-tabs"
          size="large"
        />
      </div>
    </div>
  );
}

