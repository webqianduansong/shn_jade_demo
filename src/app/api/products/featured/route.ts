import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取热门商品
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'hot', 'new', 'featured'
    const limit = parseInt(searchParams.get('limit') || '8');

    let where: any = {};
    
    if (type === 'hot') {
      where.isHot = true;
    } else if (type === 'new') {
      where.isNew = true;
    } else if (type === 'featured') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('获取商品失败:', error);
    return NextResponse.json({ error: '获取商品失败' }, { status: 500 });
  }
}


