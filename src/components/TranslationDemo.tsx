"use client";
import { useState } from 'react';
import { useLocale } from 'next-intl';
import DynamicText from './DynamicText';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslation';

export default function TranslationDemo() {
  const locale = useLocale();
  const [testTexts] = useState([
    "Natural Burmese Jadeite – Type A",
    "Handcrafted Excellence", 
    "Cultural Heritage",
    "100% natural and free from any form of chemical treatment",
    "Each piece is hand cut by our experts",
    "Where ancient Silk Road meets modern luxury"
  ]);

  const { translatedTexts, isLoading } = useDynamicTranslations(testTexts);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-4">
        Dynamic Translation Demo
      </h2>
      
      <div className="bg-card-bg border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">
          Current Language: {locale}
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-primary mb-2">Single Text Translation:</h4>
            <DynamicText fallback="Natural Burmese Jadeite – Type A">
              Natural Burmese Jadeite – Type A
            </DynamicText>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Batch Translation:</h4>
            {isLoading ? (
              <div className="space-y-2">
                {testTexts.map((_, index) => (
                  <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {translatedTexts.map((text, index) => (
                  <li key={index} className="text-secondary">
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          How it works:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Automatically detects source language (Chinese vs English)</li>
          <li>• Uses MyMemory Translation API for dynamic translation</li>
          <li>• Caches translations to avoid repeated API calls</li>
          <li>• Falls back to original text if translation fails</li>
          <li>• Shows loading states during translation</li>
        </ul>
      </div>
    </div>
  );
}
