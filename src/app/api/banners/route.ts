import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/banners
 * 获取所有启用的轮播图（公开接口）
 */
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc', // 按排序顺序升序
      },
    });

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error('获取轮播图失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取轮播图失败',
      },
      { status: 500 }
    );
  }
}

