import { prisma } from '@/lib/db';
import CategoriesClient from './CategoriesClient';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  return <CategoriesClient categories={categories} />;
}


