import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: '缺少邮箱或密码' }, { status: 400 });
    }
    // Demo: 简单校验，任何非空都视为通过
    const jar = await cookies();
    jar.set(AUTH_COOKIE_NAME, JSON.stringify({ email }), AUTH_COOKIE_OPTIONS);
    return NextResponse.json({ success: true, user: { email } });
  } catch (e) {
    return NextResponse.json({ success: false, message: '登录失败' }, { status: 500 });
  }
}


