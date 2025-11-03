"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Space, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { apiPost } from '@/lib/apiClient';

export default function RegisterPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'en';
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: { 
    email: string; 
    password: string; 
    confirmPassword: string;
    name: string;
  }) => {
    setLoading(true);
    try {
      const result = await apiPost('/api/auth/register', {
        email: values.email,
        password: values.password,
        name: values.name,
      }, {
        showError: true,
        errorMessage: locale === 'zh' ? '注册失败，请重试' : 'Registration failed',
        showSuccess: true,
        successMessage: locale === 'zh' ? '注册成功！请登录' : 'Registration successful! Please login'
      });
      
      if (result.success) {
        // 注册成功后跳转到登录页
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 1500);
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: 'calc(100vh - 140px)',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #eef2f4 100%)',
        padding: '64px 16px'
      }}
    >
      <Card
        style={{ 
          width: '100%',
          maxWidth: 420, 
          borderRadius: 12, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          margin: '0 16px'
        }}
        bodyStyle={{ padding: 28 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {locale === 'zh' ? '创建账户' : 'Create Account'}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              {locale === 'zh' ? '欢迎加入临熙玉石，请填写以下信息完成注册' : 'Welcome to Linxi Jade, please fill in the information below'}
            </Typography.Paragraph>
          </div>

          <Form 
            form={form}
            layout="vertical" 
            onFinish={onFinish} 
            validateTrigger={["onBlur", "onSubmit"]}
          >
            <Form.Item
              name="name"
              label={locale === 'zh' ? '姓名' : 'Name'}
              rules={[
                { required: true, message: locale === 'zh' ? '请输入您的姓名' : 'Please enter your name' },
                { min: 2, message: locale === 'zh' ? '姓名至少 2 个字符' : 'At least 2 characters' },
                { max: 50, message: locale === 'zh' ? '姓名最多 50 个字符' : 'Maximum 50 characters' }
              ]}
            >
              <Input 
                size="large" 
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder={locale === 'zh' ? '请输入您的姓名' : 'Enter your name'} 
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={locale === 'zh' ? '邮箱' : 'Email'}
              rules={[
                { required: true, message: locale === 'zh' ? '请输入邮箱' : 'Please enter your email' },
                { type: 'email', message: locale === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address' },
                { 
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
                  message: locale === 'zh' ? '请输入正确格式的邮箱' : 'Please enter a valid email format' 
                }
              ]}
            >
              <Input 
                size="large" 
                prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder={locale === 'zh' ? 'name@example.com' : 'name@example.com'} 
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={locale === 'zh' ? '密码' : 'Password'}
              rules={[
                { required: true, message: locale === 'zh' ? '请输入密码' : 'Please enter your password' },
                { min: 8, message: locale === 'zh' ? '密码至少 8 位' : 'At least 8 characters' },
                { 
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, 
                  message: locale === 'zh' ? '密码必须包含字母和数字' : 'Password must contain letters and numbers' 
                }
              ]}
              hasFeedback
            >
              <Input.Password 
                size="large" 
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder={locale === 'zh' ? '至少 8 位，包含字母和数字' : 'At least 8 characters with letters and numbers'} 
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={locale === 'zh' ? '确认密码' : 'Confirm Password'}
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: locale === 'zh' ? '请再次输入密码' : 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(locale === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
                size="large" 
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder={locale === 'zh' ? '请再次输入密码' : 'Confirm your password'} 
              />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value 
                      ? Promise.resolve() 
                      : Promise.reject(new Error(locale === 'zh' ? '请阅读并同意服务条款' : 'Please agree to the terms')),
                },
              ]}
              style={{ marginBottom: 16 }}
            >
              <Checkbox>
                {locale === 'zh' ? '我已阅读并同意' : 'I agree to the'}{' '}
                <Link href="#" className="nav-link" style={{ display: 'inline', padding: 0 }}>
                  {locale === 'zh' ? '《服务条款》' : 'Terms of Service'}
                </Link>
                {locale === 'zh' ? '和' : ' and '}
                <Link href="#" className="nav-link" style={{ display: 'inline', padding: 0 }}>
                  {locale === 'zh' ? '《隐私政策》' : 'Privacy Policy'}
                </Link>
              </Checkbox>
            </Form.Item>

            <Button type="primary" size="large" htmlType="submit" block loading={loading}>
              {locale === 'zh' ? '注册' : 'Register'}
            </Button>
          </Form>

          <div className="text-center" style={{ fontSize: 14, marginTop: 8 }}>
            {locale === 'zh' ? '已有账户？' : 'Already have an account?'}{' '}
            <Link href={`/${locale}/login`} className="nav-link" style={{ display: 'inline', padding: 0 }}>
              {locale === 'zh' ? '立即登录' : 'Sign in'}
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}

