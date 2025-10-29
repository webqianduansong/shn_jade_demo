"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Checkbox, Select, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { apiPost } from '@/lib/apiClient';
import '../addresses.css';

// 国家列表（常用国家）
const COUNTRIES = [
  { value: 'CN', label: '中国 China' },
  { value: 'US', label: '美国 United States' },
  { value: 'GB', label: '英国 United Kingdom' },
  { value: 'CA', label: '加拿大 Canada' },
  { value: 'AU', label: '澳大利亚 Australia' },
  { value: 'JP', label: '日本 Japan' },
  { value: 'KR', label: '韩国 South Korea' },
  { value: 'SG', label: '新加坡 Singapore' },
  { value: 'HK', label: '香港 Hong Kong' },
  { value: 'TW', label: '台湾 Taiwan' },
];

// 中国省份列表（示例，可扩展）
const CHINA_PROVINCES = [
  '北京市', '上海市', '天津市', '重庆市',
  '广东省', '浙江省', '江苏省', '福建省', '湖南省', '湖北省',
  '四川省', '云南省', '贵州省', '河南省', '河北省', '山东省',
  '山西省', '陕西省', '甘肃省', '青海省', '辽宁省', '吉林省',
  '黑龙江省', '江西省', '安徽省', '广西壮族自治区', '内蒙古自治区',
  '宁夏回族自治区', '新疆维吾尔自治区', '西藏自治区', '海南省'
];

export default function NewAddressPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('CN');

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const result = await apiPost('/api/user/addresses', values, {
        showError: true,
        showSuccess: true,
        successMessage: locale === 'zh' ? '地址添加成功' : 'Address added successfully'
      });
      
      if (result.success) {
        router.push(`/${locale}/profile/addresses`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 160px)',
      background: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* 页头 */}
        <div style={{ marginBottom: '24px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ marginBottom: '16px', color: '#2d5a3d' }}
          >
            {locale === 'zh' ? '返回' : 'Back'}
          </Button>
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: 700,
            color: '#2d5a3d',
            margin: 0,
            background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {locale === 'zh' ? '添加收货地址' : 'Add Shipping Address'}
          </h1>
        </div>

      {/* 表单 */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(45, 90, 61, 0.08)',
          border: '1px solid #e8f0ec'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            country: 'CN',
            isDefault: false
          }}
        >
          {/* 收件人信息 */}
          <div style={{ 
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e8f0ec'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2d5a3d', marginBottom: '16px' }}>
              {locale === 'zh' ? '收件人信息' : 'Recipient Information'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name="fullName"
                label={locale === 'zh' ? '收件人姓名' : 'Full Name'}
                rules={[{ required: true, message: locale === 'zh' ? '请输入收件人姓名' : 'Please enter full name' }]}
              >
                <Input size="large" placeholder={locale === 'zh' ? '请输入姓名' : 'Enter name'} />
              </Form.Item>

              <Form.Item
                name="phone"
                label={locale === 'zh' ? '手机号码' : 'Phone Number'}
                rules={[
                  { required: true, message: locale === 'zh' ? '请输入手机号码' : 'Please enter phone number' },
                  { pattern: /^[\d\s\-\+\(\)]+$/, message: locale === 'zh' ? '请输入有效的手机号码' : 'Invalid phone number' }
                ]}
              >
                <Input size="large" placeholder={locale === 'zh' ? '+86 138 0000 0000' : '+1 555 1234567'} />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              label={locale === 'zh' ? '邮箱（选填）' : 'Email (Optional)'}
              rules={[{ type: 'email', message: locale === 'zh' ? '请输入有效的邮箱地址' : 'Invalid email address' }]}
            >
              <Input size="large" placeholder={locale === 'zh' ? 'name@example.com' : 'name@example.com'} />
            </Form.Item>
          </div>

          {/* 地址信息 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#2d5a3d', marginBottom: '16px' }}>
              {locale === 'zh' ? '地址信息' : 'Address Information'}
            </h3>
            
            <Form.Item
              name="country"
              label={locale === 'zh' ? '国家/地区' : 'Country/Region'}
              rules={[{ required: true, message: locale === 'zh' ? '请选择国家' : 'Please select country' }]}
            >
              <Select
                size="large"
                showSearch
                placeholder={locale === 'zh' ? '选择国家' : 'Select country'}
                options={COUNTRIES}
                onChange={(value) => setSelectedCountry(value)}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name="state"
                label={locale === 'zh' ? '省/州' : 'State/Province'}
                rules={[{ required: true, message: locale === 'zh' ? '请输入省/州' : 'Please enter state' }]}
              >
                {selectedCountry === 'CN' ? (
                  <Select
                    size="large"
                    showSearch
                    placeholder={locale === 'zh' ? '选择省份' : 'Select province'}
                    options={CHINA_PROVINCES.map(p => ({ value: p, label: p }))}
                  />
                ) : (
                  <Input size="large" placeholder={locale === 'zh' ? '请输入省/州' : 'Enter state'} />
                )}
              </Form.Item>

              <Form.Item
                name="city"
                label={locale === 'zh' ? '城市' : 'City'}
                rules={[{ required: true, message: locale === 'zh' ? '请输入城市' : 'Please enter city' }]}
              >
                <Input size="large" placeholder={locale === 'zh' ? '请输入城市' : 'Enter city'} />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name="district"
                label={locale === 'zh' ? '区/县（选填）' : 'District (Optional)'}
              >
                <Input size="large" placeholder={locale === 'zh' ? '请输入区/县' : 'Enter district'} />
              </Form.Item>

              <Form.Item
                name="postalCode"
                label={locale === 'zh' ? '邮政编码' : 'Postal Code'}
                rules={[{ required: true, message: locale === 'zh' ? '请输入邮政编码' : 'Please enter postal code' }]}
              >
                <Input size="large" placeholder={locale === 'zh' ? '100000' : '10001'} />
              </Form.Item>
            </div>

            <Form.Item
              name="addressLine1"
              label={locale === 'zh' ? '详细地址' : 'Address Line 1'}
              rules={[{ required: true, message: locale === 'zh' ? '请输入详细地址' : 'Please enter address' }]}
            >
              <Input size="large" placeholder={locale === 'zh' ? '街道、门牌号' : 'Street address'} />
            </Form.Item>

            <Form.Item
              name="addressLine2"
              label={locale === 'zh' ? '补充地址（选填）' : 'Address Line 2 (Optional)'}
            >
              <Input size="large" placeholder={locale === 'zh' ? '公寓、楼层、单元等' : 'Apt, Suite, Unit, etc.'} />
            </Form.Item>
          </div>

          {/* 设为默认 */}
          <Form.Item name="isDefault" valuePropName="checked" style={{ marginBottom: '24px' }}>
            <Checkbox>{locale === 'zh' ? '设为默认地址' : 'Set as default address'}</Checkbox>
          </Form.Item>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => router.back()}>
              {locale === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #2d5a3d 0%, #4a8c5f 100%)',
                border: 'none',
                minWidth: '120px'
              }}
            >
              {locale === 'zh' ? '保存地址' : 'Save Address'}
            </Button>
          </div>
        </Form>
      </Card>
      </div>
    </div>
  );
}

