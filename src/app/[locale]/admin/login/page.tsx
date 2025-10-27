"use client";
import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, KeyOutlined, LoginOutlined } from '@ant-design/icons';
import './login.css';

export default function AdminLoginPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'en';
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') || '';

  const onFinish = async (values: { email: string; password: string; accessKey?: string }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace(redirect || `/${locale}/admin`);
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="admin-login-overlay"></div>
      </div>
      
      <Card className="admin-login-card" bordered={false}>
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <div className="admin-login-logo-icon">临熙</div>
            <Typography.Title level={2} className="admin-login-title">
              {locale === 'zh' ? '玉石管理系统' : 'Jade Admin'}
            </Typography.Title>
          </div>
          <Typography.Paragraph className="admin-login-subtitle">
            {locale === 'zh' ? '欢迎登录管理后台' : 'Welcome to Admin Portal'}
          </Typography.Paragraph>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg('')}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item 
            name="email" 
            label={locale === 'zh' ? '邮箱' : 'Email'} 
            rules={[
              { required: true, message: locale === 'zh' ? '请输入邮箱' : 'Please enter email' }, 
              { type: 'email', message: locale === 'zh' ? '请输入有效邮箱' : 'Please enter valid email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="input-icon" />}
              placeholder={locale === 'zh' ? '请输入邮箱地址' : 'Enter your email'}
            />
          </Form.Item>

          <Form.Item 
            name="password" 
            label={locale === 'zh' ? '密码' : 'Password'} 
            rules={[{ required: true, message: locale === 'zh' ? '请输入密码' : 'Please enter password' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="input-icon" />}
              placeholder={locale === 'zh' ? '请输入密码' : 'Enter your password'}
            />
          </Form.Item>

          <Form.Item 
            name="accessKey" 
            label={
              <span>
                {locale === 'zh' ? '访问口令' : 'Access Key'} 
                <span className="optional-label">{locale === 'zh' ? '（可选）' : '(Optional)'}</span>
              </span>
            }
          >
            <Input 
              prefix={<KeyOutlined className="input-icon" />}
              placeholder={locale === 'zh' ? '如配置了访问口令请填写' : 'Enter access key if configured'}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              icon={<LoginOutlined />}
              className="admin-login-button"
            >
              {locale === 'zh' ? '登录后台' : 'Sign in'}
            </Button>
          </Form.Item>
        </Form>

        <div className="admin-login-footer">
          <Typography.Text type="secondary">
            {locale === 'zh' ? '© 2025 玉石管理系统 版权所有' : '© 2025 Jade Admin. All rights reserved.'}
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}


