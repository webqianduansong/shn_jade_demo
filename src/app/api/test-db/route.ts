import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 测试数据库连接
export async function GET(request: NextRequest) {
  try {
    // 尝试连接数据库
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: '数据库连接失败',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

