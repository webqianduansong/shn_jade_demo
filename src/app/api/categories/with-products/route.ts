import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

// 获取分类及其商品
export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '4'); // 每个分类显示的商品数量

    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // 只返回有商品的分类
    const categoriesWithProducts = categories.filter(c => c.products.length > 0);

    return NextResponse.json({ success: true, categories: categoriesWithProducts });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}


