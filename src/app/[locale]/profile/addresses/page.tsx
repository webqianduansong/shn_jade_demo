"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Empty, Spin, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { apiGet, apiPut, apiDelete } from '@/lib/apiClient';
import './addresses.css';

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

export default function AddressesPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    const result = await apiGet('/api/user/addresses');
    if (result.success && result.data) {
      setAddresses(result.data.list || []);
    }
    setLoading(false);
  };

  const handleSetDefault = async (id: string) => {
    const result = await apiPut(`/api/user/addresses/${id}/default`, {});
    if (result.success) {
      message.success(locale === 'zh' ? '已设为默认地址' : 'Set as default address');
      loadAddresses();
    }
  };

  const handleDelete = (address: Address) => {
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
          loadAddresses();
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载中...' : 'Loading...'} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 160px)',
      background: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* 页头 */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
        <div>
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: 700,
            color: '#2d5a3d',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {locale === 'zh' ? '收货地址' : 'Shipping Addresses'}
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            {locale === 'zh' 
              ? `您有 ${addresses.length} 个收货地址，最多可保存 10 个` 
              : `You have ${addresses.length} addresses, max 10 addresses`}
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push(`/${locale}/profile/addresses/new`)}
          disabled={addresses.length >= 10}
          style={{
            background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
            border: 'none',
            borderRadius: '8px',
            height: '44px',
            padding: '0 24px'
          }}
        >
          {locale === 'zh' ? '添加新地址' : 'Add New Address'}
        </Button>
      </div>

      {/* 地址列表 */}
      {addresses.length === 0 ? (
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(45, 90, 61, 0.08)',
            border: '1px solid #e8f0ec'
          }}
        >
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
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {addresses.map((address) => (
            <Card
              key={address.id}
              style={{
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(45, 90, 61, 0.08)',
                border: address.isDefault ? '2px solid #4a8c5f' : '1px solid #e8f0ec',
                background: address.isDefault 
                  ? 'linear-gradient(135deg, #ffffff 0%, #f0f7f3 100%)' 
                  : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  {/* 标题行 */}
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ fontSize: '16px', color: '#2d5a3d' }}>
                      {address.fullName}
                    </strong>
                    <span style={{ color: '#666' }}>{address.phone}</span>
                    {address.isDefault && (
                      <Tag color="green" icon={<StarFilled />}>
                        {locale === 'zh' ? '默认' : 'Default'}
                      </Tag>
                    )}
                  </div>
                  
                  {/* 地址详情 */}
                  <div style={{ color: '#666', marginBottom: '8px', lineHeight: 1.6 }}>
                    {formatAddress(address)}
                  </div>
                  
                  {address.email && (
                    <div style={{ color: '#999', fontSize: '13px' }}>
                      {locale === 'zh' ? '邮箱：' : 'Email: '}{address.email}
                    </div>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '24px' }}>
                  {!address.isDefault && (
                    <Button
                      icon={<StarOutlined />}
                      onClick={() => handleSetDefault(address.id)}
                    >
                      {locale === 'zh' ? '设为默认' : 'Set Default'}
                    </Button>
                  )}
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/${locale}/profile/addresses/${address.id}`)}
                  >
                    {locale === 'zh' ? '编辑' : 'Edit'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(address)}
                  >
                    {locale === 'zh' ? '删除' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

