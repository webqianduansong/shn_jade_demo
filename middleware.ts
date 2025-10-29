import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import intlConfig from './next-intl.config';

const intl = createMiddleware(intlConfig);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是管理员路由（排除登录页）
  const isAdminRoute = pathname.match(/^\/(zh|en)\/admin(?!\/login)/);
  
  if (isAdminRoute) {
    // 检查是否有管理员 session cookie
    const adminSession = request.cookies.get('admin_session');
    
    if (!adminSession) {
      // 未登录，重定向到登录页
      const locale = pathname.split('/')[1] || 'zh';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // 继续国际化处理
  return intl(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


