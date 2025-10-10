# 环境变量配置说明

## 必需的环境变量

请在项目根目录创建 `.env.local` 文件，并添加以下环境变量：

```bash
# 网站基础URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe配置（用于支付功能）
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# 其他配置
NODE_ENV=development

# 数据库（Prisma）
DATABASE_URL="file:./prisma/dev.db"

# 后台管理（Admin）
# 允许登录后台的邮箱列表，逗号分隔
ADMIN_EMAILS=demo@jade.test
# 可选：后台访问口令（防止弱口令被爆破）
ADMIN_ACCESS_KEY=dev-admin-key
```

## 配置说明

1. **NEXT_PUBLIC_SITE_URL**: 网站的基础URL，用于API调用
   - 开发环境: `http://localhost:3000`
   - 生产环境: 你的域名，如 `https://yourdomain.com`

2. **STRIPE_SECRET_KEY**: Stripe的密钥，用于处理支付
   - 测试环境: 以 `sk_test_` 开头
   - 生产环境: 以 `sk_live_` 开头

3. **STRIPE_PUBLISHABLE_KEY**: Stripe的公开密钥
4. **DATABASE_URL**: 本地 SQLite 数据库文件路径（开发环境）
   - 默认使用 `prisma/dev.db`，可直接运行迁移自动创建

5. **ADMIN_EMAILS**: 允许登录后台的邮箱白名单，多个用逗号分隔
6. **ADMIN_ACCESS_KEY**: 可选的后台访问口令，若设置，登录时需额外填写

   - 测试环境: 以 `pk_test_` 开头
   - 生产环境: 以 `pk_live_` 开头

## 获取Stripe密钥

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册或登录账户
3. 在开发者 > API密钥页面获取测试密钥
4. 将密钥复制到 `.env.local` 文件中

## 注意事项

- `.env.local` 文件不会被提交到版本控制中
- 确保不要将真实的密钥提交到代码仓库
- 在生产环境中，请使用环境变量管理服务（如Vercel、Netlify等）来设置这些变量
 - 生产环境建议改为托管数据库（如 MySQL/PostgreSQL），并将 `provider` 与 `DATABASE_URL` 切换到相应驱动
