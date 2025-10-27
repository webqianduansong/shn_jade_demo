# 玉石电商网站 - 技术设计文档

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [数据库设计](#数据库设计)
- [核心功能模块](#核心功能模块)
- [API接口设计](#api接口设计)
- [国际化方案](#国际化方案)
- [部署说明](#部署说明)

---

## 项目概述

### 项目简介
基于 Next.js 14 开发的全栈玉石电商平台，支持11种语言，包含前台商城和后台管理系统。

### 核心特性
- ✅ 多语言国际化（11种语言）
- ✅ 响应式设计（桌面端+移动端）
- ✅ 商品分类管理
- ✅ 购物车系统
- ✅ 订单管理
- ✅ 用户认证
- ✅ 管理后台
- ✅ 图片上传
- ✅ 商品状态标记（热门/新品/精选）

---

## 技术栈

### 前端技术
- **框架**: Next.js 14 (App Router)
- **UI库**: Ant Design 5.x
- **样式**: CSS Modules + Global CSS
- **状态管理**: React Context + Zustand
- **国际化**: next-intl
- **图片处理**: Next/Image

### 后端技术
- **运行时**: Node.js
- **API**: Next.js API Routes
- **数据库**: SQLite (开发环境) / PostgreSQL (生产环境)
- **ORM**: Prisma
- **认证**: JWT + Cookie

### 开发工具
- **TypeScript**: 类型安全
- **ESLint**: 代码规范
- **Prisma Studio**: 数据库可视化

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────┐
│          用户界面 (Browser)              │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼────┐
   │ 前台商城 │      │管理后台 │
   └───┬────┘      └───┬────┘
       │                │
       └────────┬───────┘
                │
        ┌───────▼────────┐
        │   Next.js App   │
        │   (SSR + CSR)   │
        └───────┬─────────┘
                │
        ┌───────▼────────┐
        │  API Routes     │
        └───────┬─────────┘
                │
        ┌───────▼────────┐
        │  Prisma ORM    │
        └───────┬─────────┘
                │
        ┌───────▼────────┐
        │  SQLite/PG DB  │
        └────────────────┘
```

### 目录结构

```
jade-gems/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # 国际化路由
│   │   │   ├── page.tsx         # 首页
│   │   │   ├── products/        # 商品列表
│   │   │   ├── productDetail/   # 商品详情
│   │   │   ├── cart/            # 购物车
│   │   │   ├── profile/         # 用户中心
│   │   │   ├── login/           # 登录
│   │   │   └── admin/           # 管理后台
│   │   │       ├── products/    # 商品管理
│   │   │       ├── categories/  # 分类管理
│   │   │       ├── orders/      # 订单管理
│   │   │       └── dashboard/   # 数据统计
│   │   ├── api/                 # API路由
│   │   │   ├── auth/            # 认证相关
│   │   │   ├── products/        # 商品API
│   │   │   ├── categories/      # 分类API
│   │   │   ├── cart/            # 购物车API
│   │   │   ├── orders/          # 订单API
│   │   │   └── admin/           # 管理API
│   │   ├── globals.css          # 全局样式
│   │   └── layout.tsx           # 根布局
│   ├── components/              # 组件
│   │   ├── Header.tsx           # 头部
│   │   ├── Footer.tsx           # 底部
│   │   ├── ProductCard.tsx      # 商品卡片
│   │   ├── cart/                # 购物车组件
│   │   └── product/             # 商品详情组件
│   ├── lib/                     # 工具库
│   │   ├── auth.ts              # 用户认证
│   │   ├── adminAuth.ts         # 管理员认证
│   │   ├── db.ts                # 数据库连接
│   │   └── translation.ts       # 翻译工具
│   ├── locales/                 # 多语言文件
│   │   ├── zh.json              # 中文
│   │   ├── en.json              # 英文
│   │   └── ...                  # 其他语言
│   ├── store/                   # 状态管理
│   │   ├── cart.ts              # 购物车状态
│   │   └── cartActions.ts       # 购物车操作
│   └── types/                   # 类型定义
│       └── index.ts
├── prisma/
│   ├── schema.prisma            # 数据库模型
│   └── migrations/              # 数据库迁移
├── public/
│   └── uploads/                 # 上传的图片
└── package.json
```

---

## 数据库设计

### ER 图

```
User ──┬─→ Order ──→ OrderItem ──→ Product
       │                              ↑
       └─→ Cart ──→ CartItem ─────────┤
       └─→ Address                     │
                                       │
Category ──────────────────────────────┘
       ↓
   ProductImage
```

### 核心数据表

#### 1. User（用户表）
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  addresses Address[]
  orders    Order[]
  carts     Cart[]
}
```

#### 2. Category（分类表）
```prisma
model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  image    String?   // 分类封面图
  products Product[]
}
```

#### 3. Product（商品表）
```prisma
model Product {
  id           String         @id @default(cuid())
  name         String
  slug         String         @unique
  description  String?
  sku          String?        @unique
  model        String?
  rating       Float          @default(0)
  reviewsCount Int            @default(0)
  price        Int            // 金额（分）
  categoryId   String?
  category     Category?      @relation(...)
  images       ProductImage[]
  isHot        Boolean        @default(false)  // 热门
  isNew        Boolean        @default(false)  // 新品
  isFeatured   Boolean        @default(false)  // 精选
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  cartItems    CartItem[]
  orderItems   OrderItem[]
}
```

#### 4. ProductImage（商品图片表）
```prisma
model ProductImage {
  id        String  @id @default(cuid())
  url       String
  sortOrder Int     @default(0)
  productId String
  product   Product @relation(...)
}
```

#### 5. Cart（购物车表）
```prisma
model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(...)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

#### 6. CartItem（购物车项表）
```prisma
model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  productId String
  quantity  Int
  cart      Cart    @relation(...)
  product   Product @relation(...)
  
  @@unique([cartId, productId])
}
```

#### 7. Order（订单表）
```prisma
model Order {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(...)
  status      OrderStatus  @default(PENDING)
  totalAmount Int
  paymentRef  String?
  addressId   String?
  address     Address?     @relation(...)
  items       OrderItem[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum OrderStatus {
  PENDING  // 待支付
  PAID     // 已支付
  SHIPPED  // 已发货
  FAILED   // 失败
}
```

#### 8. Address（地址表）
```prisma
model Address {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation(...)
  line1   String
  line2   String?
  city    String
  state   String?
  country String
  postal  String
  orders  Order[]
}
```

---

## 核心功能模块

### 1. 用户认证系统

#### 前台用户认证
- **注册**: `/api/auth/register`
- **登录**: `/api/auth/login`
- **登出**: `/api/auth/logout`
- **会话验证**: JWT Token + HttpOnly Cookie

```typescript
// lib/auth.ts
export async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  return user;
}
```

#### 管理员认证
- **登录**: `/api/admin/login`
- **验证**: 基于环境变量的简单认证

```typescript
// lib/adminAuth.ts
export async function getAdminUser() {
  const token = cookies().get('admin_token')?.value;
  // 验证管理员token
}
```

### 2. 商品管理

#### 前台商品展示
- 首页热门商品
- 首页新品推荐
- 分类浏览
- 商品详情页
- 商品搜索

#### 后台商品管理
- **CRUD操作**: 创建、读取、更新、删除
- **批量操作**: 批量删除、批量调价
- **图片管理**: 多图上传、排序、删除
- **状态管理**: 热门/新品/精选标记
- **分类关联**: 商品分类绑定

```typescript
// API: /api/admin/products
POST   - 创建商品
GET    - 获取商品列表（支持分页、搜索、筛选）
PUT    - 更新商品
DELETE - 删除商品

// API: /api/admin/products/bulk
POST   - 批量操作（删除、调价）
```

### 3. 分类管理

#### 分类功能
- 创建分类（名称、Slug、图片）
- 编辑分类
- 删除分类（智能处理关联商品）
- 批量删除
- 图片上传

```typescript
// API: /api/admin/categories
POST   - 创建分类
GET    - 获取分类列表
PUT    - 更新分类
DELETE - 删除分类（支持强制删除）

// 公共API
GET /api/categories - 获取所有有商品的分类
```

### 4. 购物车系统

#### 购物车功能
- 添加商品
- 更新数量
- 删除商品
- 清空购物车
- 实时计算总价

```typescript
// store/cart.ts - Zustand状态管理
interface CartState {
  items: CartItem[];
  addItem: (item) => void;
  updateQuantity: (id, quantity) => void;
  removeItem: (id) => void;
  clearCart: () => void;
}

// API同步
POST /api/cart/add      - 添加到购物车
PUT  /api/cart/update   - 更新数量
DELETE /api/cart/remove - 删除商品
GET  /api/cart          - 获取购物车
```

### 5. 订单系统

#### 订单流程
1. 用户下单
2. 跳转支付页面
3. 支付成功/失败回调
4. 订单状态更新

```typescript
// API: /api/checkout
POST - 创建订单

// API: /api/orders
GET - 获取用户订单列表

// API: /api/admin/orders
GET - 获取所有订单（管理员）
PUT - 更新订单状态
```

### 6. 图片上传

#### 上传功能
- 文件验证（类型、大小）
- 自动重命名（时间戳+随机字符）
- 存储到 public/uploads
- 返回访问URL

```typescript
// API: /api/admin/upload
POST - 上传图片

// 处理流程
1. 验证文件类型（jpg/png/webp/gif）
2. 验证文件大小（<2MB）
3. 生成唯一文件名
4. 保存到 public/uploads/
5. 返回 /uploads/xxx.jpg
```

---

## API接口设计

### 认证API

#### POST /api/auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}

Response:
{
  "success": true,
  "user": {
    "id": "xxx",
    "email": "user@example.com",
    "name": "张三"
  }
}
```

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here"
}
```

### 商品API

#### GET /api/products/featured?type=hot&limit=8
```json
Response:
{
  "success": true,
  "products": [
    {
      "id": "xxx",
      "name": "翡翠戒指",
      "price": 299900,
      "images": [{"url": "/uploads/xxx.jpg"}],
      "category": {"name": "戒指", "slug": "rings"}
    }
  ]
}
```

#### GET /api/admin/products?page=1&pageSize=10&q=翡翠
```json
Response:
{
  "success": true,
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "list": [
    {
      "id": "xxx",
      "name": "翡翠戒指",
      "sku": "021-01",
      "price": 299900,
      "category": {"id": "xxx", "name": "戒指"},
      "images": [...],
      "isHot": true,
      "isNew": false
    }
  ]
}
```

### 分类API

#### GET /api/categories
```json
Response:
{
  "success": true,
  "categories": [
    {
      "id": "xxx",
      "name": "戒指",
      "slug": "rings",
      "image": "/uploads/xxx.jpg",
      "products": [{...}],
      "_count": {"products": 15}
    }
  ]
}
```

### 购物车API

#### POST /api/cart/add
```json
Request:
{
  "productId": "xxx",
  "quantity": 1
}

Response:
{
  "success": true,
  "cart": {
    "id": "xxx",
    "items": [
      {
        "id": "xxx",
        "product": {...},
        "quantity": 1
      }
    ]
  }
}
```

---

## 国际化方案

### 支持的语言
- 中文 (zh)
- 英文 (en)
- 日文 (ja)
- 韩文 (ko)
- 法文 (fr)
- 德文 (de)
- 西班牙文 (es)
- 意大利文 (it)
- 葡萄牙文 (pt)
- 俄文 (ru)
- 阿拉伯文 (ar)

### 实现方案

#### 1. 路由国际化
```typescript
// middleware.ts
export default createMiddleware({
  locales: ['zh', 'en', 'ja', ...],
  defaultLocale: 'zh'
});

// URL格式
/zh/products      - 中文
/en/products      - 英文
/ja/products      - 日文
```

#### 2. 翻译文件
```json
// src/locales/zh.json
{
  "nav": {
    "home": "首页",
    "products": "商品",
    "cart": "购物车"
  },
  "sections": {
    "popular": "热门商品",
    "newArrivals": "新品上市"
  }
}
```

#### 3. 使用翻译
```typescript
// 服务端组件
import {getTranslations} from 'next-intl/server';

const t = await getTranslations();
<h1>{t('nav.home')}</h1>

// 客户端组件
import {useTranslations} from 'next-intl';

const t = useTranslations();
<h1>{t('nav.home')}</h1>
```

---

## 部署说明

### 环境要求
- Node.js 18+
- npm/pnpm/yarn
- SQLite (开发) / PostgreSQL (生产)

### 环境变量

```env
# .env.local

# 数据库
DATABASE_URL="file:./prisma/dev.db"
# 生产环境
# DATABASE_URL="postgresql://user:password@localhost:5432/jadegems"

# JWT密钥
JWT_SECRET="your-secret-key-here"

# 管理员账号
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Stripe支付（可选）
STRIPE_SECRET_KEY="sk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
```

### 开发环境部署

```bash
# 1. 安装依赖
npm install

# 2. 生成Prisma Client
npx prisma generate

# 3. 运行数据库迁移
npx prisma migrate dev

# 4. （可选）运行种子数据
npx prisma db seed

# 5. 启动开发服务器
npm run dev

# 访问
# 前台: http://localhost:3000
# 管理后台: http://localhost:3000/zh/admin
```

### 生产环境部署

```bash
# 1. 构建项目
npm run build

# 2. 运行数据库迁移
npx prisma migrate deploy

# 3. 启动生产服务器
npm start

# 或使用PM2
pm2 start npm --name "jade-gems" -- start
```

### Docker部署（推荐）

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/jadegems
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=jadegems
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 性能优化

### 1. 图片优化
- 使用 Next/Image 组件
- 自动WebP转换
- 懒加载
- 响应式图片

### 2. 代码分割
- 动态导入
- 路由级别代码分割
- 组件懒加载

### 3. 缓存策略
- 静态资源缓存
- API响应缓存
- 数据库查询优化

### 4. SEO优化
- 服务端渲染（SSR）
- 元数据优化
- 结构化数据
- Sitemap生成

---

## 安全措施

### 1. 认证安全
- JWT Token
- HttpOnly Cookie
- CSRF保护
- 密码加密（bcrypt）

### 2. 数据验证
- 前端表单验证
- 后端数据验证
- SQL注入防护（Prisma）
- XSS防护

### 3. API安全
- 速率限制
- 权限验证
- 输入清理

---

## 维护与监控

### 日志系统
```typescript
// 控制台日志
console.log('用户登录:', user.email);
console.error('支付失败:', error);
```

### 错误处理
```typescript
try {
  // 业务逻辑
} catch (error) {
  console.error('错误:', error);
  return NextResponse.json(
    { error: '操作失败' }, 
    { status: 500 }
  );
}
```

### 数据备份
```bash
# SQLite备份
cp prisma/dev.db prisma/backup.db

# PostgreSQL备份
pg_dump dbname > backup.sql
```

---

## 技术债务与未来规划

### 待优化项
- [ ] 添加Redis缓存
- [ ] 实现全文搜索（Elasticsearch）
- [ ] 添加商品评价系统
- [ ] 实现实时通知
- [ ] 添加商品推荐算法
- [ ] 性能监控（Sentry）
- [ ] 单元测试覆盖

### 功能扩展
- [ ] 移动端App
- [ ] 微信小程序
- [ ] 社交分享
- [ ] 优惠券系统
- [ ] 积分系统
- [ ] 多商户支持

---

## 附录

### 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 数据库
npx prisma studio        # 打开数据库可视化
npx prisma migrate dev   # 创建迁移
npx prisma migrate reset # 重置数据库
npx prisma db seed       # 运行种子数据

# 代码质量
npm run lint             # 运行ESLint
npm run format           # 格式化代码
```

### 常见问题

**Q: 如何切换语言？**  
A: 点击页面顶部的语言切换器，或访问 /en/、/zh/ 等不同语言的URL。

**Q: 如何添加新的语言？**  
A: 
1. 在 `src/locales/` 添加新的JSON文件（如 `th.json`）
2. 在 `middleware.ts` 的 `locales` 数组中添加语言代码
3. 在 `next-intl.config.ts` 中配置

**Q: 图片上传失败怎么办？**  
A: 检查 `public/uploads/` 目录权限，确保有写入权限。

**Q: 如何修改管理员密码？**  
A: 修改 `.env.local` 文件中的 `ADMIN_PASSWORD`。

---

## 联系方式

- 开发者: [您的名字]
- Email: [您的邮箱]
- GitHub: [项目地址]

---

**版本**: 1.0.0  
**最后更新**: 2025-01-27

