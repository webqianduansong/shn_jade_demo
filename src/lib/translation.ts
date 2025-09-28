import axios from 'axios';

// 支持的语言映射
export const supportedLanguages = {
  'en': 'English',
  'zh': 'Chinese',
  'ja': 'Japanese', 
  'ko': 'Korean',
  'fr': 'French',
  'de': 'German',
  'es': 'Spanish',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ar': 'Arabic'
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// 使用免费的翻译API (MyMemory)
export async function translateText(
  text: string, 
  targetLang: SupportedLanguage, 
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  try {
    // 如果源语言和目标语言相同，直接返回
    if (sourceLang === targetLang) {
      return text;
    }

    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
        de: process.env.TRANSLATION_EMAIL || 'your-email@example.com' // 可选：添加你的邮箱以获得更高的API限制
      }
    });

    if (response.data.responseStatus === 200) {
      return response.data.responseData.translatedText;
    } else {
      console.warn('Translation failed:', response.data);
      return text; // 翻译失败时返回原文
    }
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 出错时返回原文
  }
}

// 批量翻译
export async function translateBatch(
  texts: string[], 
  targetLang: SupportedLanguage, 
  sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
  const promises = texts.map(text => translateText(text, targetLang, sourceLang));
  return Promise.all(promises);
}

// 缓存翻译结果
const translationCache = new Map<string, string>();

export async function translateWithCache(
  text: string, 
  targetLang: SupportedLanguage, 
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const translated = await translateText(text, targetLang, sourceLang);
  translationCache.set(cacheKey, translated);
  
  return translated;
}

// 智能翻译：检测文本语言并翻译
export async function smartTranslate(
  text: string, 
  targetLang: SupportedLanguage
): Promise<string> {
  // 简单的中文检测
  const isChinese = /[\u4e00-\u9fff]/.test(text);
  const sourceLang = isChinese ? 'zh' : 'en';
  
  return translateWithCache(text, targetLang, sourceLang);
}

// 使用 MyMemory API 进行翻译
export async function translateWithFallback(
  text: string, 
  targetLang: SupportedLanguage, 
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  try {
    return await translateText(text, targetLang, sourceLang);
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // 返回原文
  }
}
