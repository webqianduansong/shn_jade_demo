import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return NextResponse.json({ success: true });
}


