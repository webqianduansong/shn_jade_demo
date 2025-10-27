import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 获取所有分类（公共接口，不需要认证）
export async function GET(req: NextRequest) {
  try {
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
          take: 1, // 只获取第一个商品用于展示图片
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

