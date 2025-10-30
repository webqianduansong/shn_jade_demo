import { Suspense } from 'react';
import SuccessPageClient from './SuccessPageClient';
import { Spin } from 'antd';

/**
 * 支付成功页面（Server Component）
 */
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    }>
      <SuccessPageClient />
    </Suspense>
  );
}
