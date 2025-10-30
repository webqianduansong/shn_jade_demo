import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/banners
 * 获取所有轮播图（管理端）
 */
export async function GET(request: NextRequest) {
  try {
    // 管理员权限检查
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');
    if (!adminSession) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: {
        sortOrder: 'asc',
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

/**
 * POST /api/admin/banners
 * 创建轮播图
 */
export async function POST(request: NextRequest) {
  try {
    // 管理员权限检查
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');
    if (!adminSession) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, imageUrl, linkUrl, sortOrder, isActive } = body;

    // 验证必填字段
    if (!title || !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: '标题和图片URL不能为空',
        },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      banner,
      message: '轮播图创建成功',
    });
  } catch (error) {
    console.error('创建轮播图失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建轮播图失败',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/banners
 * 更新轮播图
 */
export async function PATCH(request: NextRequest) {
  try {
    // 管理员权限检查
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');
    if (!adminSession) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, imageUrl, linkUrl, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID不能为空',
        },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      banner,
      message: '轮播图更新成功',
    });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新轮播图失败',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/banners
 * 删除轮播图
 */
export async function DELETE(request: NextRequest) {
  try {
    // 管理员权限检查
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');
    if (!adminSession) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID不能为空',
        },
        { status: 400 }
      );
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '轮播图删除成功',
    });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除轮播图失败',
      },
      { status: 500 }
    );
  }
}

