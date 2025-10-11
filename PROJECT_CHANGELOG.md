# 项目变更记录（持续维护）

## 2025-10-10

- 初始化后端基础设施：引入 Prisma（SQLite 本地开发）。
  - 新增 `prisma/schema.prisma`：定义用户、分类、商品、购物车、订单等模型。
  - 新增 `src/lib/db.ts`：PrismaClient 单例管理，避免开发环境热重载多实例问题。
  - 更新 `ENVIRONMENT_SETUP.md`：增加 `DATABASE_URL` 并说明本地 SQLite 用法。
- 目的：为后续将本地 `@/data/products`、购物车 Cookie、订单支付履约迁移到数据库做准备。
- 影响：不影响现有前端路由与 API；后续接口将逐步从本地数据切换为数据库数据源。

### 后台登录与路由保护
- 新增 `src/lib/adminAuth.ts`：后台会话、白名单判断与工具函数。
- 新增 `/api/admin/login|logout|me`：后台登录/登出/验证。
- 新增 `/[locale]/admin/login` 与 `/[locale]/admin` 页面（占位仪表页）。
- 更新 `middleware.ts`：对 `/:locale/admin/**` 进行保护，未登录重定向到后台登录页。
- 更新 `ENVIRONMENT_SETUP.md`：新增 `ADMIN_EMAILS`、`ADMIN_ACCESS_KEY` 环境变量说明。


## 2025-10-11

### 后台仪表盘与 UI 外壳
- 新增 `src/components/SiteChrome.tsx`：根据路径自动隐藏站点 Header/Footer，后台页面更专注。
- 更新 `src/app/[locale]/layout.tsx`：使用 `SiteChrome` 包裹内容，移除基于 cookie 的判断。

### 仪表盘基础能力
- 新增 `src/app/api/admin/dashboard/route.ts`：统一统计接口，返回核心指标、最近订单、收入时间序列（按天）。
- 新增/增强 `src/app/[locale]/admin/DashboardClient.tsx`：
  - 展示统计卡片（商品数、分类数、今日订单、待处理订单、今日收入）。
  - 展示最近订单表格（订单号、用户、金额、商品数、状态、时间）。
  - 支持切换时间范围（7/30 天）并绘制简易收入折线图（原生 SVG）。
- 更新 `src/app/[locale]/admin/page.tsx`：聚合指标、查询最近订单并传递 `locale` 给客户端组件。

### 后台商品管理
- 新增 `src/app/api/admin/products/route.ts`：
  - POST 创建商品（含批量图片）
  - PUT 更新商品（覆盖图片）
  - DELETE 删除商品
- 更新 `src/app/[locale]/admin/products/page.tsx`：加载分类与完整产品信息并传递给客户端。
- 增强 `src/app/[locale]/admin/products/ProductsClient.tsx`：
  - 表格展示名称/分类/金额及操作。
  - 新增/编辑弹窗（Antd 表单：名称、分类、价格、描述、图片URL）。
  - 支持删除确认与提交后刷新。

### 影响评估
- 前台无影响；后台体验提升，进入 `/admin` 时不再出现站点 Header。
- 接口只读查询，安全风险低；后续可增加基于角色的细粒度授权。

### 前台商品详情路由统一与修复 404
- 原问题：从分类页（例如 `/${locale}/category/earrings`）点击商品进入详情时，指向 `/${locale}/productDetail?id=...`，而实际详情路由为 `/${locale}/products/[id]`，导致 404。
- 变更内容：
  - 更新 `src/components/CategoryPageClient/index.tsx` 中详情跳转与未登录重定向为 `/${locale}/products/${id}`。
  - 更新 `src/components/DynamicProductCard.tsx` 中 `Link` 与未登录重定向。
  - 更新 `src/components/EnhancedProductCard.tsx` 中 `Link` 与未登录重定向。
  - 更新 `src/components/ProductCard.tsx` 中 `Link`。
- 影响范围：前台商品卡片与分类列表的跳转路径；不影响 API 与数据库结构。
- 验证：访问 `/${locale}/category/earrings`，点击任一商品应跳转至 `/${locale}/products/{id}` 且正常渲染详情页。

### 首页“查看全部”功能完善
- 原问题：首页两个“查看全部”按钮仅刷新当前页，无实际跳转。
- 变更内容：
  - 新增 `src/app/[locale]/products/page.tsx` 列表页，使用 `CategoryPageClient` 统一展示全部商品。
  - 更新 `src/components/ProductsSection.tsx` 中两个“查看全部”链接为 `/${locale}/products`。
- 影响范围：用户可从首页跳转到完整的商品列表页，便于浏览全部商品。
- 验证：在首页点击任一“查看全部”会进入 `/${locale}/products` 并展示商品列表。

### 后台商品管理：新增字段与接口完善
- 新增字段（Prisma `Product`）：`sku`、`model`、`rating`、`reviewsCount`。
- 更新接口：`/api/admin/products` 的 POST/PUT 支持上述字段读写；GET 返回包含这些字段的数据。
- 更新前端：`src/app/[locale]/admin/products/ProductsClient.tsx`
  - 表格列新增：SKU、型号、评分、评论数。
  - 新增/编辑表单新增对应输入项，并传递给接口；默认评分 0、评论数 0。
- 影响：后台可完整录入与维护产品标题、型号、评分、金额、描述、SKU、评论数，前台详情页可进一步使用这些字段。

