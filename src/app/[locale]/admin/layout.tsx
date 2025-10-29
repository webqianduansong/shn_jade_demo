import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayout';
import { ADMIN_COOKIE_NAME, isEmailAdmin } from '@/lib/adminAuth';

export default async function AdminLayout({ 
  children, 
  params 
}: { 
  children: ReactNode; 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  
  // 读取管理员 session cookie
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  
  if (!adminSessionCookie?.value) {
    // Cookie 不存在，重定向到登录页
    redirect(`/${locale}/admin/login`);
  }
  
  try {
    // 解析 cookie 数据
    const session = JSON.parse(adminSessionCookie.value);
    
    // 验证是否是管理员邮箱
    if (!session.email || !isEmailAdmin(session.email)) {
      // 不是管理员，清除 cookie 并重定向
      cookieStore.delete(ADMIN_COOKIE_NAME);
      redirect(`/${locale}/admin/login`);
    }
    
    // 验证通过，渲染页面
    return <AdminLayoutClient locale={locale}>{children}</AdminLayoutClient>;
    
  } catch (error) {
    // Cookie 解析失败，清除并重定向
    console.error('[Admin Layout] Cookie 解析失败:', error);
    cookieStore.delete(ADMIN_COOKIE_NAME);
    redirect(`/${locale}/admin/login`);
  }
}


