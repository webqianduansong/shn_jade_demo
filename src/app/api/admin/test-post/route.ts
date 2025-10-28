import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 最简单的 POST 测试
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'POST method is working in /api/admin/',
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method',
  }, { status: 405 });
}

