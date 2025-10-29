import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API] 获取产品详情:', id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      console.log('[API] 产品不存在:', id);
      return NextResponse.json(
        { success: false, message: '产品不存在' },
        { status: 404 }
      );
    }

    const images = (product.images || []).map((img) => img.url);
    const result = {
      id: product.id,
      name: product.name,
      nameEn: product.name,
      description: product.description || '',
      descriptionEn: product.description || '',
      price: Math.round((product.price || 0) / 100),
      image: images[0] || '/images/placeholder.png',
      images,
      sku: product.sku || '',
      rating: typeof product.rating === 'number' ? product.rating : 0,
      reviewsCount: typeof product.reviewsCount === 'number' ? product.reviewsCount : 0,
      models: (product.model || '')
        ? String(product.model)
            .split(/[\,\|/;]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    console.log('[API] 产品详情获取成功:', result.name);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] 获取产品详情失败:', error);
    return NextResponse.json(
      { success: false, message: '获取产品详情失败' },
      { status: 500 }
    );
  }
}

