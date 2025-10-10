import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS, isEmailAdmin } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const { email, password, accessKey } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ success: false, message: '缺少邮箱或密码' }, { status: 400 });
  }
  if (process.env.ADMIN_ACCESS_KEY && accessKey !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ success: false, message: '无效的访问口令' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !isEmailAdmin(user.email)) {
    return NextResponse.json({ success: false, message: '无权限' }, { status: 403 });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, JSON.stringify({ id: user.id, email: user.email, role: 'admin' }), ADMIN_COOKIE_OPTIONS);
  return NextResponse.json({ success: true, user: { email: user.email } });
}


