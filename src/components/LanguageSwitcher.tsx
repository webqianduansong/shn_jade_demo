"use client";
import { Select } from 'antd';
import { useRouter, usePathname } from 'next/navigation';

const languages = [
  {code: 'en', name: 'English', native: 'EN', flag: '🇺🇸'},
  {code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳'},
  {code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵'},
  {code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷'},
  {code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷'},
  {code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪'},
  {code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸'},
  {code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹'},
  {code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹'},
  {code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺'},
  {code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦'},
];

export default function LanguageSwitcher({currentLocale}: {currentLocale: string}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (value: string) => {
    // 替换当前路径中的语言代码
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${value}`);
    // 使用 window.location 强制刷新页面以更新翻译
    window.location.href = newPath;
  };

  const options = languages.map(lang => ({
    value: lang.code,
    label: (
      <div className="flex items-center gap-2">
        <span className="text-lg">{lang.flag}</span>
        <span className="font-medium">{lang.native}</span>
      </div>
    ),
  }));

  return (
    <div className="language-switcher">
      <Select
        value={currentLocale}
        onChange={handleLanguageChange}
        options={options}
        size="small"
        variant="outlined"
        suffixIcon={
          <svg 
            className="w-3 h-3 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        }
      />
    </div>
  );
}
