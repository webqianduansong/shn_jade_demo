import { prisma } from '@/lib/db';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  // 获取初始用户列表
  let users: any[] = [];
  let total = 0;

  try {
    [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              addresses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.user.count(),
    ]);
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }

  return <UsersClient initialUsers={users} initialTotal={total} />;
}

