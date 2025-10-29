import type { ReactNode } from 'react';
import AdminLayoutClient from './AdminLayout';

/**
 * Admin 区域的共享 Layout
 * 注意：权限验证在 middleware.ts 中进行，这里只负责渲染
 * 避免在 Layout 中进行重定向，否则会影响嵌套的 /admin/login 路由
 */
export default async function AdminLayout({ 
  children, 
  params 
}: { 
  children: ReactNode; 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  return <AdminLayoutClient locale={locale}>{children}</AdminLayoutClient>;
}


