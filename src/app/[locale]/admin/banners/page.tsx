import BannersClient from './BannersClient';

export default async function AdminBannersPage() {
  // 服务端获取初始数据
  let initialBanners = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/banners`, {
      cache: 'no-store',
    });
    const data = await response.json();
    if (data.success) {
      initialBanners = data.banners;
    }
  } catch (error) {
    console.error('获取轮播图失败:', error);
  }

  return <BannersClient banners={initialBanners} />;
}

