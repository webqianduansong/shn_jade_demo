import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 简化版登录测试（不连接数据库）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // 简单验证，不连接数据库
    if (email === 'song@demo.com' && password === 'song1234') {
      return NextResponse.json({
        success: true,
        message: '登录成功（简化版）',
        user: { email }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '邮箱或密码错误'
    }, { status: 401 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: '登录失败',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: '请使用 POST 方法登录'
  }, { status: 405 });
}

