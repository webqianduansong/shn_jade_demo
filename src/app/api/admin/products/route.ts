import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function error(e: unknown, status = 500) {
  const message = e instanceof Error ? e.message : 'Server Error';
  // eslint-disable-next-line no-console
  console.error('[admin/products] ', message);
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '10')));
    const keyword = (searchParams.get('q') || '').trim();
    const categoryId = searchParams.get('categoryId') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) || 'desc';

    const where: any = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as any).gte = Math.round(Number(minPrice) * 100);
      if (maxPrice) (where.price as any).lte = Math.round(Number(maxPrice) * 100);
    }

    const [total, list] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        // 兼容无 sortOrder 字段的数据库：不指定 orderBy
        include: { images: true, category: true },
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return NextResponse.json({ success: true, total, list, page, pageSize });
  } catch (e) {
    return error(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, description, categoryId, images } = body || {};
    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ success: false, message: '缺少必要字段' }, { status: 400 });
    }
    let product;
    try {
      product = await prisma.product.create({
        data: {
          name,
          slug: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          price: Number(price),
          description: description || null,
          categoryId,
          images: images?.length ? { createMany: { data: images.map((url: string, idx: number) => ({ url, sortOrder: idx })) } } : undefined,
        },
        include: { images: true, category: true },
      });
    } catch (e: any) {
      // 兼容未迁移 sortOrder 的场景
      if (String(e?.message || '').includes('sortOrder')) {
        product = await prisma.product.create({
          data: {
            name,
            slug: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            price: Number(price),
            description: description || null,
            categoryId,
            images: images?.length ? { createMany: { data: images.map((url: string) => ({ url })) } } : undefined,
          },
          include: { images: true, category: true },
        });
      } else {
        throw e;
      }
    }
    return NextResponse.json({ success: true, product });
  } catch (e) {
    return error(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, price, description, categoryId, images } = body || {};
    if (!id) return NextResponse.json({ success: false, message: '缺少产品ID' }, { status: 400 });
    await prisma.product.update({
      where: { id },
      data: { name, price: Number(price), description: description || null, categoryId },
    });
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        try {
          await prisma.productImage.createMany({ data: images.map((url: string, idx: number) => ({ productId: id, url, sortOrder: idx })) });
        } catch (e: any) {
          if (String(e?.message || '').includes('sortOrder')) {
            await prisma.productImage.createMany({ data: images.map((url: string) => ({ productId: id, url })) });
          } else {
            throw e;
          }
        }
      }
    }
    const latest = await prisma.product.findUnique({ where: { id }, include: { images: true, category: true } });
    return NextResponse.json({ success: true, product: latest });
  } catch (e) {
    return error(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: '缺少产品ID' }, { status: 400 });
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return error(e);
  }
}


