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
  } catch (error: any) {
    console.error('获取轮播图失败:', error);
    
    // 如果表不存在 (Prisma P2021 错误)，返回空数组
    if (error?.code === 'P2021') {
      console.log('Banner 表尚未创建，返回空数组');
      return NextResponse.json({
        success: true,
        banners: [],
        message: 'Banner 表尚未创建',
      });
    }
    
    // 其他错误也返回空数组，避免首页崩溃
    return NextResponse.json({
      success: true,
      banners: [],
      error: error?.message || '获取轮播图失败',
    });
  }
}

