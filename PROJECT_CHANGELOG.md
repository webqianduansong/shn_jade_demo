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


