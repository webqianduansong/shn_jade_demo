import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS, isEmailAdmin } from '@/lib/adminAuth';

// 强制使用 Node.js Runtime（Prisma 和 bcrypt 需要）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Login] 收到登录请求');
    
    const body = await request.json();
    const { email, password, accessKey } = body;
    
    console.log('[Admin Login] 邮箱:', email);
    
    if (!email || !password) {
      console.log('[Admin Login] 缺少邮箱或密码');
      return NextResponse.json({ success: false, message: '缺少邮箱或密码' }, { status: 400 });
    }
    
    if (process.env.ADMIN_ACCESS_KEY && accessKey !== process.env.ADMIN_ACCESS_KEY) {
      console.log('[Admin Login] 访问口令错误');
      return NextResponse.json({ success: false, message: '无效的访问口令' }, { status: 401 });
    }
    
    console.log('[Admin Login] 查询数据库用户...');
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('[Admin Login] 用户不存在');
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }
    
    if (!isEmailAdmin(user.email)) {
      console.log('[Admin Login] 用户无管理员权限');
      return NextResponse.json({ success: false, message: '无权限' }, { status: 403 });
    }
    
    console.log('[Admin Login] 验证密码...');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('[Admin Login] 密码错误');
      return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
    }
    
    console.log('[Admin Login] 设置 Cookie...');
    const jar = await cookies();
    jar.set(ADMIN_COOKIE_NAME, JSON.stringify({ id: user.id, email: user.email, role: 'admin' }), ADMIN_COOKIE_OPTIONS);
    
    console.log('[Admin Login] 登录成功');
    return NextResponse.json({ success: true, user: { email: user.email } });
    
  } catch (error) {
    console.error('[Admin Login] 错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: '登录失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: '请使用 POST 方法登录' 
  }, { status: 405 });
}


