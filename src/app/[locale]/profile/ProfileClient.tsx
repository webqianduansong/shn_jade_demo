"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Tabs, Descriptions, Table, Tag, Empty, Spin, Avatar, Space, Button, Modal, message } from 'antd';
import { UserOutlined, ShoppingOutlined, SettingOutlined, HeartOutlined, EnvironmentOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiGet, apiPut, apiDelete } from '@/lib/apiClient';
import './profile.css';

interface User {
  id?: string;
  email: string;
  name?: string;
}

interface Order {
  id: string;
  orderNo: string;
  status: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
  }>;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  country: string;
  state: string;
  city: string;
  district?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  isDefault: boolean;
}

interface ProfileClientProps {
  locale: string;
  user: User;
}

export default function ProfileClient({ locale, user }: ProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // 初始化时检查 URL 参数
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['info', 'orders', 'addresses'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);
  
  // 监听刷新参数
  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    if (refreshParam && activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [searchParams, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await apiGet('/api/orders');
      if (result.success && result.data) {
        // API 返回格式: { success: true, data: { orders: [...] } }
        const ordersData = result.data.orders || [];
        setOrders(ordersData);
        console.log('[Profile] 获取订单成功:', ordersData.length, '个订单');
      } else {
        console.warn('[Profile] 获取订单失败:', result);
        setOrders([]);
      }
    } catch (error) {
      console.error('[Profile] Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const result = await apiGet('/api/user/addresses');
      if (result.success && result.data) {
        setAddresses(result.data.list || []);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await apiPut(`/api/user/addresses/${id}/default`, {});
    if (result.success) {
      message.success(locale === 'zh' ? '已设为默认地址' : 'Set as default address');
      fetchAddresses();
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Modal.confirm({
      title: locale === 'zh' ? '确认删除' : 'Confirm Delete',
      content: locale === 'zh' 
        ? `确定要删除地址"${address.fullName}"吗？` 
        : `Are you sure you want to delete address "${address.fullName}"?`,
      okText: locale === 'zh' ? '删除' : 'Delete',
      cancelText: locale === 'zh' ? '取消' : 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await apiDelete(`/api/user/addresses/${address.id}`);
        if (result.success) {
          message.success(locale === 'zh' ? '地址删除成功' : 'Address deleted');
          fetchAddresses();
        }
      }
    });
  };

  const formatAddress = (address: Address) => {
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
      title: locale === 'zh' ? '订单号' : 'Order No.',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      render: (orderNo: string, record: Order) => (
        <span 
          className="order-id" 
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => router.push(`/${locale}/orders/${record.id}`)}
        >
          {orderNo || `#${record.id.slice(0, 8).toUpperCase()}`}
        </span>
      ),
    },
    {
      title: locale === 'zh' ? '商品信息' : 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => (
        <div className="order-items">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <div key={item.id || index} className="order-item">
                <span className="item-name">{item.productName}</span>
                <span className="item-quantity">×{item.quantity}</span>
              </div>
            ))
          ) : (
            <span style={{ color: '#999' }}>暂无商品</span>
          )}
        </div>
      ),
    },
    {
      title: locale === 'zh' ? '金额' : 'Amount',
      dataIndex: 'totalCents',
      key: 'totalCents',
      width: 120,
      render: (totalCents: number) => (
        <span className="order-amount">
          ${((totalCents || 0) / 100).toFixed(2)}
        </span>
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
    {
      key: 'addresses',
      label: (
        <span>
          <EnvironmentOutlined />
          {locale === 'zh' ? '收货地址' : 'Addresses'}
        </span>
      ),
      children: (
        <Card className="addresses-card" bordered={false}>
          {addressLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div className="address-header">
                <p className="address-count">
                  {locale === 'zh' 
                    ? `您有 ${addresses.length} 个收货地址，最多可保存 10 个` 
                    : `You have ${addresses.length} addresses, max 10 addresses`}
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push(`/${locale}/profile/addresses/new`)}
                  disabled={addresses.length >= 10}
                  className="add-address-btn"
                >
                  <span className="btn-text">{locale === 'zh' ? '添加新地址' : 'Add New'}</span>
                </Button>
              </div>

              {addresses.length === 0 ? (
                <Empty
                  description={locale === 'zh' ? '暂无收货地址' : 'No addresses yet'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push(`/${locale}/profile/addresses/new`)}
                  >
                    {locale === 'zh' ? '添加地址' : 'Add Address'}
                  </Button>
                </Empty>
              ) : (
                <div className="addresses-list">
                  {addresses.map((address) => (
                    <Card
                      key={address.id}
                      size="small"
                      className={`address-item ${address.isDefault ? 'default' : ''}`}
                    >
                      <div className="address-content">
                        <div className="address-info">
                          <div className="address-title">
                            <strong className="name">{address.fullName}</strong>
                            <span className="phone">{address.phone}</span>
                            {address.isDefault && (
                              <Tag color="green" icon={<StarFilled />} className="default-tag">
                                {locale === 'zh' ? '默认' : 'Default'}
                              </Tag>
                            )}
                          </div>
                          <div className="address-detail">
                            {formatAddress(address)}
                          </div>
                        </div>
                        <div className="address-actions">
                          {!address.isDefault && (
                            <Button
                              size="small"
                              icon={<StarOutlined />}
                              onClick={() => handleSetDefault(address.id)}
                              className="action-btn"
                            >
                              <span className="btn-text">{locale === 'zh' ? '设为默认' : 'Default'}</span>
                            </Button>
                          )}
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => router.push(`/${locale}/profile/addresses/${address.id}`)}
                            className="action-btn"
                          >
                            <span className="btn-text">{locale === 'zh' ? '编辑' : 'Edit'}</span>
                          </Button>
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteAddress(address)}
                            className="action-btn"
                          >
                            <span className="btn-text">{locale === 'zh' ? '删除' : 'Delete'}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
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

