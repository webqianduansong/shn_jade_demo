# 动态翻译系统

这个系统提供了智能的动态翻译功能，无需手动维护多语言翻译文件。

## 特性

- 🌍 **自动语言检测**：自动识别中文和英文内容
- 🚀 **实时翻译**：使用免费的 MyMemory Translation API 进行实时翻译
- 💾 **智能缓存**：避免重复翻译，提高性能
- 🔄 **批量翻译**：支持同时翻译多个文本
- 🛡️ **错误处理**：翻译失败时优雅降级到原文
- ⚡ **加载状态**：提供翻译过程中的加载指示
- 💰 **完全免费**：使用免费的翻译服务，无额外费用

## 使用方法

### 1. 基础组件使用

```tsx
import DynamicText from '@/components/DynamicText';

// 简单文本翻译
<DynamicText fallback="Natural Jade">
  Natural Jade
</DynamicText>

// 标题翻译
<DynamicTitle level={1} fallback="Product Name">
  Product Name
</DynamicTitle>

// 段落翻译
<DynamicParagraph fallback="Product description">
  Product description
</DynamicParagraph>
```

### 2. Hook 使用

```tsx
import { useDynamicTranslation, useDynamicTranslations } from '@/hooks/useDynamicTranslation';

// 单个文本翻译
function MyComponent() {
  const { translatedText, isLoading } = useDynamicTranslation("Natural Jade");
  
  return (
    <div>
      {isLoading ? "Loading..." : translatedText}
    </div>
  );
}

// 批量翻译
function BatchComponent() {
  const texts = ["Natural Jade", "Handcrafted", "Cultural Heritage"];
  const { translatedTexts, isLoading } = useDynamicTranslations(texts);
  
  return (
    <div>
      {isLoading ? "Loading..." : translatedTexts.join(", ")}
    </div>
  );
}
```

### 3. API 使用

```tsx
// POST 请求
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Natural Jade",
    targetLang: "ja",
    sourceLang: "en"
  })
});

// GET 请求
const response = await fetch('/api/translate?text=Natural%20Jade&targetLang=ja&sourceLang=en');
```

## 支持的语言

- `en` - English
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `fr` - French
- `de` - German
- `es` - Spanish
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ar` - Arabic

## 配置

### 环境变量

```env
# 可选：添加你的邮箱以获得更高的API限制
TRANSLATION_EMAIL=your-email@example.com
```

### MyMemory API 限制

- **免费使用**：无需注册或API密钥
- **请求限制**：每分钟最多1000次请求
- **字符限制**：单次请求最多500字符
- **邮箱验证**：添加邮箱可获得更高的API限制

## 性能优化

1. **缓存机制**：翻译结果会被缓存，避免重复请求
2. **批量处理**：使用 `useDynamicTranslations` 进行批量翻译
3. **预定义翻译**：常用词汇使用预定义翻译，减少API调用
4. **错误处理**：翻译失败时优雅降级

## 示例

查看 `src/components/TranslationDemo.tsx` 了解完整的使用示例。

## 注意事项

1. **API限制**：MyMemory API 有免费使用限制，建议添加邮箱以获得更高限制
2. **网络依赖**：翻译需要网络连接
3. **翻译质量**：自动翻译可能不如人工翻译准确
4. **缓存清理**：可以使用 `clearTranslationCache()` 清理缓存
5. **完全免费**：无需担心额外费用，适合个人和小型项目

## 优势

- ✅ **完全免费**：无需API密钥或付费
- ✅ **简单易用**：无需复杂配置
- ✅ **自动缓存**：避免重复翻译
- ✅ **错误处理**：翻译失败时优雅降级
- ✅ **多语言支持**：支持11种主要语言
