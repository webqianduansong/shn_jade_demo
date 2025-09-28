import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {locales} from '@/i18n/request';

/**
 * 从Accept-Language头中检测最佳匹配的语言
 * 
 * @param acceptLanguage - 浏览器发送的Accept-Language头部值
 * @returns 最佳匹配的区域设置代码
 */
function detectLanguage(acceptLanguage: string): string {
  if (!acceptLanguage) return 'en';
  
  // 解析Accept-Language头，格式如: "zh-CN,zh;q=0.9,en;q=0.8"
  const langPriorities = acceptLanguage
    .split(',')
    .map(lang => {
      const [langCode, priority = 'q=1.0'] = lang.trim().split(';');
      const q = parseFloat(priority.replace('q=', '')) || 0;
      return { code: langCode.split('-')[0], priority: q };
    })
    .sort((a, b) => b.priority - a.priority);
  
  // 尝试找到最高优先级的支持语言
  for (const lang of langPriorities) {
    if (locales.includes(lang.code)) {
      return lang.code;
    }
  }
  
  return 'en'; // 默认回退到英语
}

export default async function Home() {
  const hdrs = await headers();
  const acceptLanguage = hdrs.get('accept-language') || '';
  
  // 使用改进的语言检测逻辑
  const locale = detectLanguage(acceptLanguage);
  
  redirect(`/${locale}`);
}
