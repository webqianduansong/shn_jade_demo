"use client";
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { smartTranslate, SupportedLanguage } from '@/lib/translation';

export function useDynamicTranslation(text: string) {
  const locale = useLocale() as SupportedLanguage;
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (locale === 'en' || locale === 'zh') {
      // 英文和中文不需要翻译
      setTranslatedText(text);
      return;
    }

    setIsLoading(true);
    smartTranslate(text, locale)
      .then(translated => {
        setTranslatedText(translated);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Translation failed:', error);
        setTranslatedText(text);
        setIsLoading(false);
      });
  }, [text, locale]);

  return { translatedText, isLoading };
}

// 批量翻译Hook
export function useDynamicTranslations(texts: string[]) {
  const locale = useLocale() as SupportedLanguage;
  const [translatedTexts, setTranslatedTexts] = useState(texts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (locale === 'en' || locale === 'zh') {
      setTranslatedTexts(texts);
      return;
    }

    setIsLoading(true);
    Promise.all(texts.map(text => smartTranslate(text, locale)))
      .then(translated => {
        setTranslatedTexts(translated);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Batch translation failed:', error);
        setTranslatedTexts(texts);
        setIsLoading(false);
      });
  }, [texts, locale]);

  return { translatedTexts, isLoading };
}
