import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 健康检查和调试API
export async function GET(request: NextRequest) {
  const adminEmails = process.env.ADMIN_EMAILS || '(未配置)';
  const hasAccessKey = !!process.env.ADMIN_ACCESS_KEY;
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    success: true,
    message: 'API 路由正常工作',
    timestamp: new Date().toISOString(),
    config: {
      adminEmails: adminEmails.split(',').map(e => e.trim()),
      hasAccessKey,
    },
    cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'cookie': request.headers.get('cookie') ? '(存在)' : '(无)',
    }
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'POST 请求正常工作',
    timestamp: new Date().toISOString(),
  });
}

