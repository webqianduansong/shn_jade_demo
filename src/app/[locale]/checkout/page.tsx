"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Radio, Button, Input, Empty, Spin, Divider, message, Modal } from 'antd';
import { EnvironmentOutlined, PlusOutlined, ShoppingOutlined, TruckOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiGet, apiPost } from '@/lib/apiClient';
import './checkout.css';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  district?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  isDefault: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function CheckoutPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // 并发加载地址和购物车
    const [addressResult, cartResult] = await Promise.all([
      apiGet('/api/user/addresses'),
      apiGet('/api/cart/get')
    ]);
    
    if (addressResult.success && addressResult.data) {
      const addressList = addressResult.data.list || [];
      setAddresses(addressList);
      // 自动选择默认地址
      const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      }
    }
    
    if (cartResult.success && cartResult.data) {
      const cartItems = cartResult.data;
      setCart(cartItems);
      
      // 获取商品详情
      if (cartItems.length > 0) {
        const productMap: Record<string, Product> = {};
        const productPromises = cartItems.map((item: CartItem) =>
          apiGet(`/api/products/${item.productId}`)
        );
        const productResults = await Promise.all(productPromises);
        
        productResults.forEach((result) => {
          if (result.success && result.data) {
            productMap[result.data.id] = result.data;
          }
        });
        
        setProducts(productMap);
      }
    }
    
    setLoading(false);
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

  // 计算金额
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const product = products[item.productId];
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    const shipping = shippingMethod === 'standard' ? 15 : 30;
    const discount = 0;
    
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount
    };
  };

  const handleSubmit = async () => {
    // 验证
    if (!selectedAddressId) {
      message.error(locale === 'zh' ? '请选择收货地址' : 'Please select shipping address');
      return;
    }
    
    if (cart.length === 0) {
      message.error(locale === 'zh' ? '购物车为空' : 'Cart is empty');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 获取选中的地址
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        message.error(locale === 'zh' ? '地址无效' : 'Invalid address');
        return;
      }
      
      // 创建订单
      const result = await apiPost('/api/orders/create', {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          country: selectedAddress.country,
          state: selectedAddress.state,
          city: selectedAddress.city,
          district: selectedAddress.district,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          postalCode: selectedAddress.postalCode
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingMethod: shippingMethod === 'standard' ? '标准配送' : '快速配送',
        paymentMethod: paymentMethod === 'alipay' ? '支付宝' : paymentMethod === 'wechat' ? '微信支付' : '信用卡',
        remark
      }, {
        showError: true,
        showSuccess: false
      });
      
      if (result.success && result.data?.order) {
        // 显示成功模态框
        Modal.success({
          title: locale === 'zh' ? '订单创建成功！' : 'Order Created Successfully!',
          content: locale === 'zh' 
            ? `订单号：${result.data.order.orderNo}` 
            : `Order No: ${result.data.order.orderNo}`,
          onOk: () => {
            router.push(`/${locale}/orders/${result.data.order.id}`);
          }
        });
      }
    } catch (error) {
      console.error('Create order error:', error);
    } finally {
      setSubmitting(false);
    }
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

  const { subtotal, shipping, discount, total } = calculateTotal();

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1 className="checkout-title">
          {locale === 'zh' ? '结算' : 'Checkout'}
        </h1>

        <div className="checkout-grid">
          {/* 左侧：订单信息 */}
          <div className="checkout-main">
            {/* 1. 收货地址 */}
            <Card className="checkout-section">
              <div className="section-header">
                <EnvironmentOutlined className="section-icon" />
                <h2 className="section-title">
                  {locale === 'zh' ? '收货地址' : 'Shipping Address'}
                </h2>
              </div>
              
              {addresses.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={locale === 'zh' ? '暂无收货地址' : 'No address'}
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
                <>
                  <Radio.Group
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="address-radio-group"
                  >
                    {addresses.map((address) => (
                      <Radio key={address.id} value={address.id} className="address-radio">
                        <div className="address-item">
                          <div className="address-header">
                            <strong>{address.fullName}</strong>
                            <span className="address-phone">{address.phone}</span>
                            {address.isDefault && (
                              <span className="default-badge">
                                {locale === 'zh' ? '默认' : 'Default'}
                              </span>
                            )}
                          </div>
                          <div className="address-detail">
                            {formatAddress(address)}
                          </div>
                        </div>
                      </Radio>
                    ))}
                  </Radio.Group>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => router.push(`/${locale}/profile/addresses/new`)}
                    style={{ marginTop: '12px' }}
                  >
                    {locale === 'zh' ? '使用新地址' : 'Use New Address'}
                  </Button>
                </>
              )}
            </Card>

            {/* 2. 配送方式 */}
            <Card className="checkout-section">
              <div className="section-header">
                <TruckOutlined className="section-icon" />
                <h2 className="section-title">
                  {locale === 'zh' ? '配送方式' : 'Shipping Method'}
                </h2>
              </div>
              
              <Radio.Group
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="shipping-radio-group"
              >
                <Radio value="standard" className="shipping-radio">
                  <div className="shipping-item">
                    <strong>{locale === 'zh' ? '标准配送' : 'Standard Shipping'}</strong>
                    <span className="shipping-time">
                      {locale === 'zh' ? '7-15天' : '7-15 days'}
                    </span>
                    <span className="shipping-price">¥15</span>
                  </div>
                </Radio>
                <Radio value="express" className="shipping-radio">
                  <div className="shipping-item">
                    <strong>{locale === 'zh' ? '快速配送' : 'Express Shipping'}</strong>
                    <span className="shipping-time">
                      {locale === 'zh' ? '3-7天' : '3-7 days'}
                    </span>
                    <span className="shipping-price">¥30</span>
                  </div>
                </Radio>
              </Radio.Group>
            </Card>

            {/* 3. 支付方式 */}
            <Card className="checkout-section">
              <div className="section-header">
                <CreditCardOutlined className="section-icon" />
                <h2 className="section-title">
                  {locale === 'zh' ? '支付方式' : 'Payment Method'}
                </h2>
              </div>
              
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="payment-radio-group"
              >
                <Radio value="alipay">{locale === 'zh' ? '支付宝' : 'Alipay'}</Radio>
                <Radio value="wechat">{locale === 'zh' ? '微信支付' : 'WeChat Pay'}</Radio>
                <Radio value="card">{locale === 'zh' ? '信用卡/借记卡' : 'Credit/Debit Card'}</Radio>
              </Radio.Group>
            </Card>

            {/* 4. 订单备注 */}
            <Card className="checkout-section">
              <h3 className="remark-title">
                {locale === 'zh' ? '订单备注（选填）' : 'Order Remark (Optional)'}
              </h3>
              <Input.TextArea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={locale === 'zh' ? '如有特殊要求，请在此填写' : 'Special requirements'}
                rows={3}
                maxLength={200}
                showCount
              />
            </Card>
          </div>

          {/* 右侧：订单摘要 */}
          <div className="checkout-sidebar">
            <Card className="order-summary">
              <h2 className="summary-title">
                <ShoppingOutlined style={{ marginRight: '8px' }} />
                {locale === 'zh' ? '订单摘要' : 'Order Summary'}
              </h2>
              
              <Divider style={{ margin: '16px 0' }} />
              
              {/* 商品列表 */}
              <div className="summary-items">
                {cart.map((item) => {
                  const product = products[item.productId];
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="summary-item">
                      <img 
                        src={product.images[0]?.url || '/placeholder.png'} 
                        alt={product.name}
                        className="summary-item-image"
                      />
                      <div className="summary-item-info">
                        <div className="summary-item-name">{product.name}</div>
                        <div className="summary-item-quantity">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="summary-item-price">
                        ¥{((product.price / 100) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              {/* 费用明细 */}
              <div className="summary-details">
                <div className="summary-row">
                  <span>{locale === 'zh' ? '商品小计' : 'Subtotal'}</span>
                  <span>¥{(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>{locale === 'zh' ? '运费' : 'Shipping'}</span>
                  <span>¥{shipping.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>{locale === 'zh' ? '优惠' : 'Discount'}</span>
                    <span>-¥{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              {/* 总计 */}
              <div className="summary-total">
                <span>{locale === 'zh' ? '总计' : 'Total'}</span>
                <span className="total-price">¥{((total / 100) + shipping - discount).toFixed(2)}</span>
              </div>
              
              {/* 提交按钮 */}
              <Button
                type="primary"
                size="large"
                block
                loading={submitting}
                onClick={handleSubmit}
                disabled={!selectedAddressId || cart.length === 0}
                className="submit-button"
                icon={<CheckCircleOutlined />}
              >
                {locale === 'zh' ? '提交订单' : 'Place Order'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

