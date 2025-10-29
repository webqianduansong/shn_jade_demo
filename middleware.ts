import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import intlConfig from './next-intl.config';

const intl = createMiddleware(intlConfig);

// 允许的管理员邮箱列表
const ADMIN_EMAILS = ['song@demo.com'];

function isEmailAdmin(email: string): boolean {
  const envEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return [...ADMIN_EMAILS, ...envEmails].includes(email);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是管理员路由（排除登录页）
  const isAdminRoute = pathname.match(/^\/(zh|en)\/admin(?!\/login)/);
  
  if (isAdminRoute) {
    // 检查是否有管理员 session cookie
    const adminSessionCookie = request.cookies.get('admin_session');
    
    if (!adminSessionCookie?.value) {
      // Cookie 不存在，重定向到登录页
      const locale = pathname.split('/')[1] || 'zh';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      // 解析并验证 cookie
      const session = JSON.parse(adminSessionCookie.value);
      
      if (!session.email || !isEmailAdmin(session.email)) {
        // 不是管理员邮箱，清除 cookie 并重定向
        const locale = pathname.split('/')[1] || 'zh';
        const loginUrl = new URL(`/${locale}/admin/login`, request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('admin_session');
        return response;
      }
    } catch (error) {
      // Cookie 解析失败，清除并重定向
      const locale = pathname.split('/')[1] || 'zh';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }
  
  // 继续国际化处理
  return intl(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


