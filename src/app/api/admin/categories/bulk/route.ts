import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// 批量操作
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ids } = body;

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    if (action === 'delete') {
      const { force } = body; // 是否强制删除
      
      // 检查是否有分类下还有商品
      const categoriesWithProducts = await prisma.category.findMany({
        where: { id: { in: ids } },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      const hasProducts = categoriesWithProducts.filter(c => c._count.products > 0);
      
      if (hasProducts.length > 0) {
        if (!force) {
          const names = hasProducts.map(c => c.name).join('、');
          const totalProducts = hasProducts.reduce((sum, c) => sum + c._count.products, 0);
          return NextResponse.json(
            { 
              error: `分类 ${names} 下还有 ${totalProducts} 个商品`,
              canForceDelete: true
            },
            { status: 400 }
          );
        } else {
          // 强制删除：先清除所有商品的分类关联
          await prisma.product.updateMany({
            where: { categoryId: { in: ids } },
            data: { categoryId: null }
          });
        }
      }

      // 批量删除
      await prisma.category.deleteMany({
        where: { id: { in: ids } }
      });

      return NextResponse.json({ 
        success: true, 
        message: force ? '已删除分类并清除商品关联' : '批量删除成功' 
      });
    }

    return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
  } catch (error) {
    console.error('批量操作失败:', error);
    return NextResponse.json({ error: '批量操作失败' }, { status: 500 });
  }
}
