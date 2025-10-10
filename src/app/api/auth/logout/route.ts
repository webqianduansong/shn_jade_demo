import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const jar = await cookies();
  // 清除cookie
  jar.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return NextResponse.json({ success: true });
}


