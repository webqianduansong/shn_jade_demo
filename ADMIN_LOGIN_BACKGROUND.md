# 管理后台登录页面背景配置说明

## 📋 当前配置

登录页面目前使用**玉石绿渐变背景**，配色方案如下：

- 深玉石绿: `#1a4d2e`
- 中玉石绿: `#2d5a3d`
- 亮玉石绿: `#4a8c5f`

背景采用多色渐变 + 动态位移动画，营造优雅的视觉效果。

## 🎨 如何使用自定义背景图片

### 方法1：直接替换为背景图

1. 将背景图片放到 `public` 目录下，例如：
   ```
   public/admin-bg.jpg
   ```

2. 编辑 `src/app/[locale]/admin/login/login.css` 文件：

找到 `.admin-login-background` 样式，修改为：

```css
.admin-login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 使用背景图 */
  background-image: url('/admin-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}
```

### 方法2：背景图 + 渐变叠加

如果想在背景图上叠加玉石绿色调：

```css
.admin-login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 背景图 + 渐变叠加 */
  background: 
    linear-gradient(135deg, 
      rgba(26, 77, 46, 0.6) 0%,
      rgba(45, 90, 61, 0.5) 50%,
      rgba(26, 77, 46, 0.6) 100%
    ),
    url('/admin-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}
```

### 方法3：背景图 + 模糊效果

添加模糊效果使卡片更突出：

```css
.admin-login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/admin-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(8px);
  z-index: 0;
}
```

## 🖼️ 推荐的背景图片

### 尺寸建议
- **最小尺寸**: 1920 x 1080 px
- **推荐尺寸**: 2560 x 1440 px 或更高
- **格式**: JPG (优化文件大小) 或 PNG

### 主题建议
1. **玉石主题**
   - 玉石纹理特写
   - 玉器产品展示
   - 玉石雕刻工艺

2. **自然主题**
   - 山水风景（绿色调）
   - 竹林、茶园
   - 中式园林

3. **抽象主题**
   - 绿色几何图案
   - 水墨渐变
   - 现代简约设计

### 色调建议
- 主色调：绿色系
- 辅助色：白色、灰色、金色
- 避免：过于鲜艳的红、黄、蓝

## 🎯 背景图优化建议

### 1. 图片优化
```bash
# 使用工具压缩图片（推荐 TinyPNG 或 ImageOptim）
# 目标：文件大小 < 500KB
```

### 2. 响应式背景
为不同设备提供不同尺寸的图片：

```css
.admin-login-background {
  background-image: url('/admin-bg-mobile.jpg');
}

@media (min-width: 768px) {
  .admin-login-background {
    background-image: url('/admin-bg-tablet.jpg');
  }
}

@media (min-width: 1920px) {
  .admin-login-background {
    background-image: url('/admin-bg-desktop.jpg');
  }
}
```

### 3. WebP 格式支持
现代浏览器推荐使用 WebP 格式（更小的文件大小）：

```css
.admin-login-background {
  background-image: url('/admin-bg.webp');
}

/* 不支持 WebP 的浏览器回退 */
@supports not (background-image: url('/admin-bg.webp')) {
  .admin-login-background {
    background-image: url('/admin-bg.jpg');
  }
}
```

## 🔄 当前渐变配色方案

如果需要调整渐变颜色，修改以下代码：

```css
.admin-login-background {
  background: linear-gradient(135deg, 
    #1a4d2e 0%,      /* 深绿 */
    #2d5a3d 25%,     /* 玉石绿 */
    #4a8c5f 50%,     /* 亮绿 */
    #2d5a3d 75%,     /* 玉石绿 */
    #1a4d2e 100%     /* 深绿 */
  );
}
```

### 其他渐变方案示例

**方案A：深色系**
```css
background: linear-gradient(135deg, #0f3a1f 0%, #1a4d2e 50%, #0f3a1f 100%);
```

**方案B：明亮系**
```css
background: linear-gradient(135deg, #4a8c5f 0%, #6fb881 50%, #4a8c5f 100%);
```

**方案C：多色系**
```css
background: linear-gradient(135deg, 
  #1a4d2e 0%, 
  #2d5a3d 33%, 
  #4a8c5f 66%, 
  #1a4d2e 100%
);
```

## 📝 注意事项

1. **性能考虑**
   - 背景图文件大小尽量控制在 500KB 以内
   - 使用 lazy loading 对于大图片
   - 考虑使用 CDN 加速

2. **可访问性**
   - 确保登录表单在背景上清晰可见
   - 保持足够的对比度
   - 避免过于复杂的背景图案

3. **品牌一致性**
   - 背景应与网站整体风格协调
   - 颜色应符合品牌色彩规范
   - 考虑在前台网站和后台管理使用相似风格

## 🎨 在线工具推荐

- **渐变生成器**: https://cssgradient.io/
- **图片压缩**: https://tinypng.com/
- **图片格式转换**: https://cloudconvert.com/
- **配色方案**: https://coolors.co/

---

**文件位置**: `src/app/[locale]/admin/login/login.css`  
**最后更新**: 2025-10-27

