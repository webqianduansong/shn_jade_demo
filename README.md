# 🪨 玉石电商网站 (Jade Gems E-commerce)

一个基于 Next.js 14 开发的现代化玉石电商平台，支持11种语言，提供完整的前台商城和后台管理系统。

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ 主要特性

### 🌍 国际化支持
- **11种语言**: 中文、英文、日语、韩语、法语、德语、西班牙语、意大利语、葡萄牙语、俄语、阿拉伯语
- **智能语言切换**: 基于用户偏好自动切换
- **SEO友好**: 每种语言都有独立的URL

### 🛒 前台商城功能
- **商品浏览**: 分类浏览、搜索、筛选
- **商品详情**: 多图展示、规格选择、评分展示
- **购物车**: 实时更新、持久化存储
- **用户系统**: 注册、登录、个人中心
- **订单管理**: 下单、支付、订单追踪
- **响应式设计**: 完美适配桌面、平板、手机

### 🎛️ 管理后台功能
- **商品管理**: CRUD操作、批量编辑、状态标记
- **分类管理**: 分类CRUD、图片上传
- **订单管理**: 订单查看、状态更新
- **数据统计**: 销售趋势、商品统计
- **图片管理**: 多图上传、排序、删除

### 📱 移动端优化
- **响应式布局**: 自适应各种屏幕尺寸
- **触摸优化**: 流畅的手势操作
- **横向滚动**: 分类横向滚动浏览
- **性能优化**: 图片懒加载、代码分割

### 🎨 现代化设计
- **优雅UI**: 参考淘宝、京东等主流电商平台
- **流畅动画**: CSS3动画和过渡效果
- **卡片布局**: 现代化的卡片式设计
- **深色模式**: 支持浅色/深色主题切换

---

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm, yarn 或 pnpm
- SQLite (开发环境) / PostgreSQL (生产环境)

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/jade-gems.git
cd jade-gems
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件
# 设置数据库URL、JWT密钥等
```

4. **初始化数据库**
```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# （可选）运行种子数据
npx prisma db seed
```

5. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

6. **访问应用**
- 前台: http://localhost:3000
- 管理后台: http://localhost:3000/zh/admin

### 默认管理员账号

```
邮箱: admin@example.com
密码: admin123
```

**⚠️ 重要**: 首次登录后请立即修改密码！

---

## 📁 项目结构

```
jade-gems/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # 国际化路由
│   │   │   ├── admin/         # 管理后台
│   │   │   ├── products/      # 商品页面
│   │   │   ├── cart/          # 购物车
│   │   │   └── ...
│   │   └── api/               # API路由
│   ├── components/            # React组件
│   ├── lib/                   # 工具函数
│   ├── locales/              # 多语言文件
│   ├── store/                # 状态管理
│   └── types/                # TypeScript类型
├── prisma/
│   ├── schema.prisma         # 数据库模型
│   └── migrations/           # 数据库迁移
├── public/
│   └── uploads/              # 上传的图片
└── package.json
```

---

## 🛠️ 技术栈

### 核心框架
- **[Next.js 14](https://nextjs.org/)**: React全栈框架，支持SSR/SSG
- **[TypeScript](https://www.typescriptlang.org/)**: 类型安全的JavaScript超集
- **[React 18](https://react.dev/)**: UI组件库

### UI & 样式
- **[Ant Design](https://ant.design/)**: 企业级UI组件库
- **CSS Modules**: 组件级样式隔离
- **Global CSS**: 全局样式和主题

### 数据层
- **[Prisma](https://www.prisma.io/)**: 现代化ORM
- **SQLite**: 开发环境数据库
- **PostgreSQL**: 生产环境数据库（推荐）

### 国际化
- **[next-intl](https://next-intl-docs.vercel.app/)**: Next.js国际化方案
- **11种语言支持**: 覆盖全球主要市场

### 状态管理
- **[Zustand](https://zustand-demo.pmnd.rs/)**: 轻量级状态管理
- **React Context**: 组件状态共享

### 认证 & 安全
- **JWT**: JSON Web Token认证
- **bcrypt**: 密码加密
- **Cookie**: 会话管理

### 开发工具
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **Prisma Studio**: 数据库可视化

---

## 📚 文档

### 核心文档
- **[技术设计文档](TECHNICAL_DESIGN.md)**: 详细的系统架构、数据库设计、API接口说明
- **[用户操作手册](USER_MANUAL.md)**: 完整的用户使用指南，包含前台和后台操作说明

### 在线演示
- 前台演示: [https://demo.example.com](https://demo.example.com)
- 后台演示: [https://demo.example.com/admin](https://demo.example.com/admin)

---

## 🎯 核心功能

### 前台功能

#### 1. 商品浏览
- 首页热门商品展示
- 首页新品推荐
- 分类横向滚动浏览
- 商品搜索和筛选
- 商品详情页（多图展示、规格选择）

#### 2. 用户系统
- 用户注册与登录
- 个人信息管理
- 收货地址管理
- 订单历史查看

#### 3. 购物流程
- 加入购物车
- 购物车管理（增删改）
- 订单结算
- 在线支付（Stripe）
- 订单追踪

### 后台功能

#### 1. 商品管理
- 商品CRUD操作
- 批量操作（删除、调价）
- 多图上传和排序
- 状态标记（热门/新品/精选）
- 商品搜索和筛选

#### 2. 分类管理
- 分类CRUD操作
- 分类图片上传
- 批量删除
- 智能删除（处理关联商品）

#### 3. 订单管理
- 订单列表查看
- 订单状态更新
- 订单详情查看
- 订单导出

#### 4. 数据统计
- 销售统计
- 商品统计
- 用户统计
- 趋势图表

---

## 🌐 支持的语言

| 语言 | 代码 | 状态 |
|------|------|------|
| 简体中文 | zh | ✅ |
| English | en | ✅ |
| 日本語 | ja | ✅ |
| 한국어 | ko | ✅ |
| Français | fr | ✅ |
| Deutsch | de | ✅ |
| Español | es | ✅ |
| Italiano | it | ✅ |
| Português | pt | ✅ |
| Русский | ru | ✅ |
| العربية | ar | ✅ |

---

## 📦 部署

### Vercel部署（推荐）

1. 在Vercel导入项目
2. 配置环境变量
3. 部署

### Docker部署

```bash
# 构建镜像
docker build -t jade-gems .

# 运行容器
docker run -p 3000:3000 jade-gems
```

### 传统部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

详细部署指南请查看 [技术设计文档](TECHNICAL_DESIGN.md#部署说明)。

---

## 🧪 测试

```bash
# 运行单元测试
npm run test

# 运行E2E测试
npm run test:e2e

# 查看测试覆盖率
npm run test:coverage
```

---

## 📸 截图

### 前台页面
![首页](docs/screenshots/home.png)
![商品详情](docs/screenshots/product-detail.png)
![购物车](docs/screenshots/cart.png)

### 管理后台
![商品管理](docs/screenshots/admin-products.png)
![分类管理](docs/screenshots/admin-categories.png)
![数据统计](docs/screenshots/admin-dashboard.png)

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 贡献指南

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范

- 遵循ESLint规则
- 使用TypeScript类型
- 编写清晰的注释
- 保持代码简洁

---

## 📝 待办事项

### 高优先级
- [ ] 添加商品评价系统
- [ ] 实现全文搜索
- [ ] 添加商品收藏功能
- [ ] 优惠券系统

### 中优先级
- [ ] 添加Redis缓存
- [ ] 实现实时通知
- [ ] 移动端App
- [ ] 微信小程序

### 低优先级
- [ ] 社交分享
- [ ] 积分系统
- [ ] 多商户支持
- [ ] AI商品推荐

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

---

## 👥 团队

- **开发者**: [您的名字]
- **设计师**: [设计师名字]
- **产品经理**: [PM名字]

---

## 📧 联系我们

- **官网**: [https://example.com](https://example.com)
- **邮箱**: support@example.com
- **GitHub**: [https://github.com/yourusername/jade-gems](https://github.com/yourusername/jade-gems)
- **问题反馈**: [GitHub Issues](https://github.com/yourusername/jade-gems/issues)

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Prisma](https://www.prisma.io/)
- [next-intl](https://next-intl-docs.vercel.app/)

以及所有为本项目做出贡献的开发者！

---

## ⭐ Star历史

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/jade-gems&type=Date)](https://star-history.com/#yourusername/jade-gems&Date)

---

**Made with ❤️ by [Your Name]**

**版本**: 1.0.0  
**最后更新**: 2025-01-27
# Manual deployment trigger

测试自动部署 - 2025-10-29 16:18:28

强制部署触发 - 2025-10-29 16:41:01
仓库已设为公开，重新测试自动部署
