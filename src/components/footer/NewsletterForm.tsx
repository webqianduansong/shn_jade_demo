"use client";
import { useState } from 'react';
import { Input, Button, Space, App } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

/**
 * 邮件订阅表单组件
 * 处理用户邮箱订阅功能
 */
export default function NewsletterForm() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  
  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @returns 是否为有效邮箱格式
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 处理邮件订阅提交
   */
  const handleNewsletterSubmit = async () => {
    if (!email.trim()) {
      message.warning(t('emailRequired') || 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      message.error(t('emailInvalid') || 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        message.success(t('subscribeSuccess') || 'Successfully subscribed to newsletter!');
        setEmail(''); // 清空输入框
      } else {
        message.error(result.error || t('subscribeError') || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      message.error(t('subscribeError') || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-form">
      <Space.Compact style={{ width: '100%' }}>
        <Input 
          style={{ width: 'calc(100% - 80px)' }}
          placeholder={t('emailPlaceholder')} 
          prefix={<MailOutlined />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={handleNewsletterSubmit}
          status={email && !validateEmail(email) ? 'error' : ''}
        />
        <Button 
          type="primary" 
          style={{ width: '80px' }}
          onClick={handleNewsletterSubmit}
          loading={loading}
          disabled={!email.trim() || !validateEmail(email)}
          className="newsletter-submit-btn"
        >
          {t('subscribe')}
        </Button>
      </Space.Compact>
      {email && !validateEmail(email) && (
        <div className="newsletter-error">
          {t('emailInvalid') || 'Please enter a valid email address'}
        </div>
      )}
    </div>
  );
}
