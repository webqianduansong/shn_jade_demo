import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 测试 POST 方法
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'POST 请求成功',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '解析请求失败',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
}

// 测试 GET 方法
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'GET 请求成功',
    timestamp: new Date().toISOString(),
  });
}

