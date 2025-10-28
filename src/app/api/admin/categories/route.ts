import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

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

    // 直接返回数组，不包装在对象中
    return NextResponse.json(categories);
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
    const { name, slug, image } = body;

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
      data: { 
        name, 
        slug,
        image: image || null
      }
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
    const { id, name, slug, image } = body;

    console.log('收到更新请求:', { id, name, slug, image });

    if (!id || !name || !slug) {
      console.error('参数不完整:', { id, name, slug });
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      console.error('分类不存在:', id);
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // 检查slug是否被其他分类使用
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    });

    if (existing) {
      console.error('Slug冲突:', slug, existing.id);
      return NextResponse.json({ error: 'Slug已被其他分类使用' }, { status: 400 });
    }

    // 构建更新数据
    const updateData: any = { 
      name, 
      slug
    };
    
    // 只有当image字段存在时才更新
    if (image !== undefined) {
      updateData.image = image;
    }

    console.log('更新数据:', updateData);

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData
    });

    console.log('更新成功:', updatedCategory);

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error('更新分类失败:', error);
    const errorMessage = error instanceof Error ? error.message : '更新分类失败';
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    const force = req.nextUrl.searchParams.get('force') === 'true'; // 是否强制删除

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
