"use client";
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import AdminShell from './AdminShell';

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
  
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  return <AdminShell locale={locale}>{children}</AdminShell>;
}

