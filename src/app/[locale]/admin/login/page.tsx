"use client";
import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Space } from 'antd';

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
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 140px)', padding: '64px 16px' }}>
      <Card style={{ width: 420, borderRadius: 12 }} bodyStyle={{ padding: 28 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>{locale === 'zh' ? 'dede后台登录' : 'Admin Sign in'}</Typography.Title>
          {errorMsg && (
            <Typography.Paragraph type="danger" style={{ margin: 0 }}>{errorMsg}</Typography.Paragraph>
          )}
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label={locale === 'zh' ? '邮箱' : 'Email'} rules={[{ required: true }, { type: 'email' }]}>
              <Input size="large" placeholder="name@example.com" />
            </Form.Item>
            <Form.Item name="password" label={locale === 'zh' ? '密码' : 'Password'} rules={[{ required: true }] }>
              <Input.Password size="large" placeholder={locale === 'zh' ? '请输入密码' : 'Enter password'} />
            </Form.Item>
            <Form.Item name="accessKey" label={locale === 'zh' ? '访问口令（可选）' : 'Access Key (optional)'}>
              <Input size="large" placeholder={locale === 'zh' ? '如配置了 ADMIN_ACCESS_KEY 必须填写' : 'Required if ADMIN_ACCESS_KEY configured'} />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              {locale === 'zh' ? '登录后台' : 'Sign in to Admin'}
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}


