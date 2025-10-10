import createMiddleware from 'next-intl/middleware';
import intlConfig from './next-intl.config';
import { NextRequest, NextResponse } from 'next/server';

const intl = createMiddleware(intlConfig);

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  // 后台路径保护：匹配 /:locale/admin 及其子路由
  const adminMatch = pathname.match(/^\/(\w{2})(?:-[\w-]+)?\/admin(\/.*)?$/);
  if (adminMatch) {
    const cookie = request.cookies.get('admin_session');
    if (!cookie?.value) {
      const locale = adminMatch[1] || 'en';
      const res = NextResponse.redirect(new URL(`/${locale}/admin/login?redirect=${encodeURIComponent(pathname)}`, request.url));
      res.cookies.set('admin_ui', '1', { path: '/', sameSite: 'lax' });
      return res;
    }
    const res = intl(request) as NextResponse;
    res.cookies.set('admin_ui', '1', { path: '/', sameSite: 'lax' });
    return res;
  }
  const res = intl(request) as NextResponse;
  // 非后台路径清除标记
  res.cookies.set('admin_ui', '', { path: '/', maxAge: 0 });
  return res;
}

export const config = {
  matcher: ['/((?!_next|.*\..*).*)']
};


