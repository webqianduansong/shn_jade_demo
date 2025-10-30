import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import CategoryPageClient from '@/components/CategoryPageClient/index';
import { prisma } from '@/lib/db';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{locale: string; categoryId: string}>;
}) {
  const {locale, categoryId} = await params;
  const t = await getTranslations();
  
  // 从数据库读取分类（支持通过 id 或 slug 查询）
  let category = await prisma.category.findUnique({ where: { id: categoryId } });
  
  // 如果通过 id 找不到，尝试通过 slug 查询
  if (!category) {
    category = await prisma.category.findUnique({ where: { slug: categoryId } });
  }
  
  if (!category) {
    notFound();
  }

  // 从数据库读取该分类下的产品
  const dbProducts = await prisma.product.findMany({
    where: { categoryId: category.id },
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  });

  // 映射为前端 UI 需求的数据结构
  const categoryProducts = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    nameEn: p.name,
    description: '',
    descriptionEn: '',
    price: Math.round((p.price || 0) / 100),
    image: (p.images && p.images[0] && p.images[0].url) ? p.images[0].url : '/images/placeholder.png',
  }));

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Category Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 mb-8">
        <div className="py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {category.name}
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              {/* 数据库暂未维护分类描述，这里留空或日后接入多语言字段 */}
            </p>
            <div className="text-sm text-gray-500">
              {categoryProducts.length} {locale === 'zh' ? '件精美商品等您挑选' : 'exquisite items available'}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <CategoryPageClient products={categoryProducts} locale={locale} />
    </div>
  );
}
