"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Space, Divider, Checkbox } from 'antd';
import { GoogleOutlined, AppleOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'en';
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') || '';

  const socialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      // Demo: 模拟三方登录成功后写入会话
      const email = provider === 'google' ? 'google_user@example.com' : 'apple_user@example.com';
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'oauth' })
      });
      if (res.ok) {
        router.replace(redirect || `/${locale}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.replace(redirect || `/${locale}`);
      }
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
        style={{ width: 420, borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
        bodyStyle={{ padding: 28 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {locale === 'zh' ? '登录账户' : 'Sign in'}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              {locale === 'zh' ? '欢迎回来，请输入您的账户信息' : 'Welcome back, please enter your account details'}
            </Typography.Paragraph>
          </div>

          {/* Social Sign-in */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              size="large"
              block
              icon={<GoogleOutlined />}
              onClick={() => socialLogin('google')}
            >
              {locale === 'zh' ? '使用 Google 登录' : 'Continue with Google'}
            </Button>
            <Button
              size="large"
              block
              icon={<AppleOutlined />}
              onClick={() => socialLogin('apple')}
            >
              {locale === 'zh' ? '使用 Apple 登录' : 'Continue with Apple'}
            </Button>
          </Space>

          <Form layout="vertical" onFinish={onFinish} validateTrigger={["onBlur", "onSubmit"]}>
            <Form.Item
              name="email"
              label={locale === 'zh' ? '邮箱' : 'Email'}
              rules={[
                { required: true, message: locale === 'zh' ? '请输入邮箱' : 'Please enter your email' },
                { type: 'email', message: locale === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address' }
              ]}
            >
              <Input size="large" placeholder={locale === 'zh' ? 'name@example.com' : 'name@example.com'} />
            </Form.Item>

            <Form.Item
              name="password"
              label={locale === 'zh' ? '密码' : 'Password'}
              rules={[
                { required: true, message: locale === 'zh' ? '请输入密码' : 'Please enter your password' },
                { min: 6, message: locale === 'zh' ? '密码至少 6 位' : 'At least 6 characters' }
              ]}
            >
              <Input.Password size="large" placeholder={locale === 'zh' ? '请输入密码' : 'Enter password'} />
            </Form.Item>

            <div className="flex justify-between" style={{ marginBottom: 12 }}>
              <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>{locale === 'zh' ? '记住我' : 'Remember me'}</Checkbox>
              </Form.Item>
              <Link href="#" className="nav-link" style={{ padding: 0 }}>
                {locale === 'zh' ? '忘记密码？' : 'Forgot password?'}
              </Link>
            </div>

            <Button type="primary" size="large" htmlType="submit" block loading={loading}>
              {locale === 'zh' ? '登录' : 'Login'}
            </Button>
          </Form>

          <Divider plain style={{ margin: '8px 0' }}>
            {locale === 'zh' ? '或' : 'or'}
          </Divider>

          <div className="text-center" style={{ fontSize: 14 }}>
            {locale === 'zh' ? '还没有账户？' : "Don't have an account?"}{' '}
            <Link href="#" className="nav-link" style={{ display: 'inline', padding: 0 }}>
              {locale === 'zh' ? '创建账户' : 'Create one'}
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}


