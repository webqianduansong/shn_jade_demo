"use client";

import { Spin } from 'antd';

interface AuthLoadingOverlayProps {
  locale?: string;
}

/**
 * 全局身份验证加载遮罩层
 * 覆盖整个页面，阻止用户操作
 */
export default function AuthLoadingOverlay({ locale = 'zh' }: AuthLoadingOverlayProps) {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      zIndex: 9999,
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spin size="large" />
      <div style={{ fontSize: '16px', color: '#666' }}>
        {locale === 'zh' ? '验证身份中...' : 'Authenticating...'}
      </div>
    </div>
  );
}

