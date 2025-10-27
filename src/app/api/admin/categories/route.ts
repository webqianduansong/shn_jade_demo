import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminUser } from '@/lib/adminAuth';

// 获取所有分类
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

// 创建新分类
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '名称和Slug不能为空' }, { status: 400 });
    }

    // 检查slug是否已存在
    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug已存在' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}

// 更新分类
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, slug } = body;

    if (!id || !name || !slug) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    // 检查slug是否被其他分类使用
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug已被其他分类使用' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const force = searchParams.get('force') === 'true'; // 是否强制删除

    if (!id) {
      return NextResponse.json({ error: '分类ID不能为空' }, { status: 400 });
    }

    // 检查是否有关联的商品
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    if (category._count.products > 0) {
      if (!force) {
        // 如果不是强制删除，返回错误和商品数量
        return NextResponse.json(
          { 
            error: `该分类下还有 ${category._count.products} 个商品`,
            productCount: category._count.products,
            canForceDelete: true
          },
          { status: 400 }
        );
      } else {
        // 强制删除：先清除商品的分类关联
        await prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: null }
        });
      }
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: force ? '已删除分类并清除商品关联' : '删除成功' 
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}

