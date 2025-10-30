"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Grid, Modal, Radio, Button, message, Space } from 'antd';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { useNotification } from './Notification';
import CartList from './cart/CartList';
import OrderSummary from './cart/OrderSummary';
import EmptyCart from './cart/EmptyCart';
import { CartItemWithProduct } from '@/types';

const { useBreakpoint } = Grid;

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

interface CartClientProps {
  items: CartItemWithProduct[];
  totalAmount: number;
  locale: string;
  onCheckout?: () => Promise<void>;
}

/**
 * 购物车客户端组件
 * 负责管理购物车页面的整体布局和结账流程
 */
export default function CartClient({ items, totalAmount, locale, onCheckout: externalCheckout }: CartClientProps) {
  const { NotificationContainer } = useNotification();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const screens = useBreakpoint();
  
  /**
   * 获取用户的收货地址列表
   */
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await fetch('/api/user/addresses');
      const data = await response.json();
      
      if (response.ok && data.success) {
        const addressList = data.data?.list || [];
        setAddresses(addressList);
        
        // 自动选中默认地址
        const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressList.length > 0) {
          setSelectedAddressId(addressList[0].id);
        }
        
        return addressList;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      return [];
    } finally {
      setLoadingAddresses(false);
    }
  };
  
  /**
   * 处理结账过程
   */
  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      // 1. 登录检查
      const me = await fetch('/api/auth/me');
      if (!me.ok) {
        window.location.href = `/${locale}/login?redirect=/${locale}/cart`;
        return;
      }
      
      // 2. 检查收货地址
      const addressList = await fetchAddresses();
      
      if (addressList.length === 0) {
        // 没有收货地址，引导用户添加
        Modal.confirm({
          title: locale === 'zh' ? '需要添加收货地址' : 'Address Required',
          icon: <EnvironmentOutlined style={{ color: '#faad14' }} />,
          content: locale === 'zh' 
            ? '您还没有收货地址，请先添加收货地址后再进行结账。' 
            : 'You need to add a shipping address before checkout.',
          okText: locale === 'zh' ? '去添加地址' : 'Add Address',
          cancelText: locale === 'zh' ? '取消' : 'Cancel',
          onOk: () => {
            router.push(`/${locale}/profile?tab=addresses`);
          }
        });
        setIsCheckingOut(false);
        return;
      }
      
      // 3. 显示地址选择弹窗
      setShowAddressModal(true);
      setIsCheckingOut(false);
      
    } catch (error) {
      console.error('Checkout error:', error);
      message.error(locale === 'zh' ? '结账失败，请重试' : 'Checkout failed, please try again');
      setIsCheckingOut(false);
    }
  };
  
  /**
   * 确认选择地址并进行支付
   */
  const handleConfirmAddress = async () => {
    if (!selectedAddressId) {
      message.warning(locale === 'zh' ? '请选择收货地址' : 'Please select a shipping address');
      return;
    }
    
    setShowAddressModal(false);
    setIsCheckingOut(true);
    
    try {
      if (externalCheckout) {
        // 使用从页面传入的结账函数（server action）
        await externalCheckout();
      } else {
        // 默认的结账逻辑
        // 转换数据格式：将 CartItemWithProduct 转换为 Stripe 需要的 lineItems 格式
        const lineItems = items.map(item => ({
          id: item.productId,
          quantity: item.quantity
        }));
        
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            lineItems,
            addressId: selectedAddressId // 携带选中的地址 ID
          }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.url) {
          // 跳转到 Stripe Checkout 页面
          window.location.href = data.url;
        } else {
          throw new Error(data.error || data.message || 'Checkout failed');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      message.error(locale === 'zh' ? '支付失败，请重试' : 'Payment failed, please try again');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 如果购物车为空
  if (items.length === 0) {
    return <EmptyCart locale={locale} />;
  }

  return (
    <>
      <Row gutter={[24, 24]}>
        {/* 购物车商品列表 */}
        <Col xs={24} lg={16}>
          <CartList 
            items={items}
            locale={locale}
          />
        </Col>
        
        {/* 订单摘要 */}
        <Col xs={24} lg={8}>
          <OrderSummary
            totalAmount={totalAmount}
            itemCount={items.length}
            locale={locale}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        </Col>
      </Row>
      
      {/* 地址选择弹窗 */}
      <Modal
        title={
          <Space>
            <EnvironmentOutlined />
            {locale === 'zh' ? '选择收货地址' : 'Select Shipping Address'}
          </Space>
        }
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={[
          <Button 
            key="add"
            icon={<PlusOutlined />}
            onClick={() => {
              setShowAddressModal(false);
              router.push(`/${locale}/profile?tab=addresses`);
            }}
          >
            {locale === 'zh' ? '新增地址' : 'Add New'}
          </Button>,
          <Button 
            key="cancel" 
            onClick={() => setShowAddressModal(false)}
          >
            {locale === 'zh' ? '取消' : 'Cancel'}
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            loading={isCheckingOut}
            onClick={handleConfirmAddress}
          >
            {locale === 'zh' ? '确认并支付' : 'Confirm & Pay'}
          </Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px 0' }}>
          {loadingAddresses ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              {locale === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : (
            <Radio.Group
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {addresses.map((address) => (
                  <Radio 
                    key={address.id} 
                    value={address.id}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '1px solid #e8e8e8',
                      borderRadius: '8px',
                      background: selectedAddressId === address.id ? '#f0f9ff' : '#fff',
                      borderColor: selectedAddressId === address.id ? '#1890ff' : '#e8e8e8',
                    }}
                  >
                    <div style={{ marginLeft: '8px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '15px' }}>{address.fullName}</strong>
                        <span style={{ marginLeft: '12px', color: '#666' }}>{address.phone}</span>
                        {address.isDefault && (
                          <span style={{
                            marginLeft: '12px',
                            padding: '2px 8px',
                            background: '#52c41a',
                            color: 'white',
                            fontSize: '12px',
                            borderRadius: '4px',
                          }}>
                            {locale === 'zh' ? '默认' : 'Default'}
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {`${address.state} ${address.city}${address.district ? ' ' + address.district : ''}`}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {address.addressLine1}
                        {address.addressLine2 && ` ${address.addressLine2}`}
                      </div>
                      <div style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>
                        {address.postalCode}
                      </div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}
        </div>
      </Modal>
      
      <NotificationContainer />
    </>
  );
}
