import { translateText, SupportedLanguage } from './translation';

// 智能翻译缓存
const smartCache = new Map<string, string>();

// 预定义的翻译映射（避免重复翻译）
const predefinedTranslations = {
  // 产品相关
  'jade': {
    'en': 'jade',
    'zh': '玉石',
    'ja': 'ジェード',
    'ko': '제이드',
    'fr': 'jade',
    'de': 'Jade',
    'es': 'jade',
    'it': 'giada',
    'pt': 'jade',
    'ru': 'нефрит',
    'ar': 'يشب'
  },
  'natural': {
    'en': 'natural',
    'zh': '天然',
    'ja': '天然',
    'ko': '천연',
    'fr': 'naturel',
    'de': 'natürlich',
    'es': 'natural',
    'it': 'naturale',
    'pt': 'natural',
    'ru': 'натуральный',
    'ar': 'طبيعي'
  },
  'handcrafted': {
    'en': 'handcrafted',
    'zh': '手工制作',
    'ja': '手作り',
    'ko': '수제',
    'fr': 'fait main',
    'de': 'handgefertigt',
    'es': 'hecho a mano',
    'it': 'fatto a mano',
    'pt': 'feito à mão',
    'ru': 'ручная работа',
    'ar': 'صنع يدوي'
  }
};

// 智能翻译：优先使用预定义翻译，然后使用API翻译
export async function smartTranslate(
  text: string, 
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  // 检查缓存
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (smartCache.has(cacheKey)) {
    return smartCache.get(cacheKey)!;
  }

  // 检查预定义翻译
  const lowerText = text.toLowerCase();
  if (predefinedTranslations[lowerText as keyof typeof predefinedTranslations]) {
    const predefined = predefinedTranslations[lowerText as keyof typeof predefinedTranslations][targetLang];
    if (predefined) {
      smartCache.set(cacheKey, predefined);
      return predefined;
    }
  }

  // 使用API翻译
  try {
    const translated = await translateText(text, targetLang, sourceLang);
    smartCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    console.error('Smart translation failed:', error);
    return text; // 失败时返回原文
  }
}

// 批量智能翻译
export async function smartTranslateBatch(
  texts: string[], 
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
  const promises = texts.map(text => smartTranslate(text, targetLang, sourceLang));
  return Promise.all(promises);
}

// 清理缓存
export function clearTranslationCache(): void {
  smartCache.clear();
}

// 获取缓存统计
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: smartCache.size,
    keys: Array.from(smartCache.keys())
  };
}
