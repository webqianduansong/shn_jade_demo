/**
 * 图片地址解析工具函数
 * 兼容三种写法：
 * 1) 远程地址字符串 http(s) → 经由 /api/img 代理
 * 2) 本地字符串 '/products/a.jpg' 或 'products/a.jpg' → 转换为以 / 开头
 * 3) 静态导入对象 import pic from '@/public/xxx.jpg' → 使用 pic.src
 * 
 * @param img 图片对象，可以是字符串、静态导入对象等
 * @returns 解析后的图片地址字符串
 */
export function resolveSrc(img: unknown): string {
  if (!img) return '';
  if (typeof img === 'string') {
    if (img.startsWith('http')) return `/api/img?u=${encodeURIComponent(img)}`;
    return img.startsWith('/') ? img : `/${img}`;
  }
  const anyImg = img as {src?: string};
  if (anyImg && typeof anyImg.src === 'string') return anyImg.src;
  return '';
}
