"use client";
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import AdminShell from './AdminShell';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AuthLoadingOverlay from '@/components/AuthLoadingOverlay';

export default function AdminLayoutClient({ 
  children, 
  locale 
}: { 
  children: ReactNode; 
  locale: string;
}) {
  const pathname = usePathname();
  
  // 如果是登录页面，不显示侧边栏和头部导航
  const isLoginPage = pathname?.endsWith('/admin/login');
  
  // 登录页面不需要验证
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // 非登录页面需要验证身份
  const { isAuthenticating } = useAdminAuth();
  
  // 验证中，显示全局加载遮罩
  if (isAuthenticating) {
    return <AuthLoadingOverlay locale={locale} />;
  }
  
  // 验证完成，渲染管理后台
  return <AdminShell locale={locale}>{children}</AdminShell>;
}

