import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import CategoryPageClient from '@/components/CategoryPageClient/index';
import {categories} from '@/data/categories';
import products from '@/data/products';
import { Breadcrumb, Space, Divider } from 'antd';
import { HomeOutlined, ShopOutlined } from '@ant-design/icons';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{locale: string; categoryId: string}>;
}) {
  const {locale, categoryId} = await params;
  const t = await getTranslations();
  
  // 查找分类信息
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) {
    notFound();
  }

  // 根据分类筛选产品（这里简化处理，实际项目中可能需要更复杂的筛选逻辑）
  const categoryProducts = products.filter(product => {
    // 简单的关键词匹配，实际项目中应该使用更精确的分类系统
    const productName = locale === 'zh' ? product.name : product.nameEn;
    const categoryName = locale === 'zh' ? category.nameZh : category.name;
    
    // 根据分类ID进行匹配
    switch (categoryId) {
      case 'rings':
        return productName.toLowerCase().includes('ring') || 
               productName.toLowerCase().includes('戒指');
      case 'earrings':
        return productName.toLowerCase().includes('earring') || 
               productName.toLowerCase().includes('耳环');
      case 'necklaces':
        return productName.toLowerCase().includes('necklace') || 
               productName.toLowerCase().includes('pendant') ||
               productName.toLowerCase().includes('项链') ||
               productName.toLowerCase().includes('挂件');
      case 'bracelets':
        return productName.toLowerCase().includes('bracelet') || 
               productName.toLowerCase().includes('bangle') ||
               productName.toLowerCase().includes('手链') ||
               productName.toLowerCase().includes('手镯');
      default:
        return true;
    }
  });

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Category Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 mb-8">
        <div className="py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {locale === 'zh' ? category.nameZh : category.name}
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              {locale === 'zh' ? category.descriptionZh : category.description}
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
