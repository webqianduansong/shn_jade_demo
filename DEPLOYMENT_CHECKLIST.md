# 🚀 部署前检查清单

在部署项目到 Cloudflare Pages 之前，请按照此清单逐项完成配置。

## ✅ 已完成的配置

- [x] 创建 `.env.example` 环境变量模板
- [x] 更新 `package.json` 构建脚本（添加 `prisma generate`）
- [x] 创建云存储适配器 `src/lib/uploadAdapter.ts`
- [x] 更新图片上传 API 支持云存储
- [x] 安装 `@aws-sdk/client-s3` 依赖

## 📋 部署前必须完成的配置

### 1. 准备外部服务账号

#### 数据库服务（必需 - 二选一）
- [ ] **Supabase**（推荐）
  - 注册：https://supabase.com
  - 免费 500MB PostgreSQL
  - 创建项目并获取 `DATABASE_URL`
  
- [ ] **Neon**
  - 注册：https://neon.tech
  - 免费 3GB PostgreSQL
  - 创建项目并获取连接字符串

#### 图片存储服务（必需 - 二选一）
- [ ] **Cloudflare R2**（推荐 - 同一平台）
  - 进入 Cloudflare Dashboard → R2
  - 创建 bucket: `jade-gems-uploads`
  - 创建 API Token 并记录：
    - `R2_ENDPOINT`
    - `R2_ACCESS_KEY_ID`
    - `R2_SECRET_ACCESS_KEY`
    - `R2_PUBLIC_URL`

- [ ] **AWS S3**
  - 创建 S3 bucket
  - 配置 CORS 规则
  - 创建 IAM 用户并获取：
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`

#### 支付服务（如需要）
- [ ] **Stripe**
  - 注册：https://stripe.com
  - 获取密钥：
    - `STRIPE_SECRET_KEY`
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

### 2. 修改数据库配置

编辑 `prisma/schema.prisma`，将数据库从 SQLite 改为 PostgreSQL：

```prisma
datasource db {
  provider = "postgresql"  // 从 "sqlite" 改为 "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 3. 推送代码到 GitHub

```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "准备部署到 Cloudflare Pages"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/你的用户名/jade-gems.git
git branch -M main
git push -u origin main
```

---

### 4. 在 Cloudflare 配置环境变量

登录 Cloudflare Dashboard → Workers & Pages → 创建项目 → 配置以下环境变量：

#### 必需的环境变量

```env
# 数据库（PostgreSQL 连接字符串）
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT 密钥（生成一个随机字符串）
JWT_SECRET=随机生成一个长字符串

# 管理员账号
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=强密码
```

#### R2 云存储配置（如使用 R2）

```env
R2_ENDPOINT=https://[账户ID].r2.cloudflarestorage.com
R2_BUCKET_NAME=jade-gems-uploads
R2_ACCESS_KEY_ID=你的Access_Key_ID
R2_SECRET_ACCESS_KEY=你的Secret_Access_Key
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

#### S3 云存储配置（如使用 S3）

```env
AWS_S3_BUCKET=jade-gems-uploads
AWS_S3_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=你的Access_Key_ID
AWS_SECRET_ACCESS_KEY=你的Secret_Access_Key
```

#### Stripe 支付配置（如使用）

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

### 5. 配置 Cloudflare Pages 构建设置

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/`
- **Node.js version**: 18.x 或更高

---

### 6. 初始化生产数据库

部署成功后，运行数据库迁移：

```bash
# 方法1：本地运行迁移到生产数据库
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy

# 方法2：生成并推送数据库结构
npx prisma db push

# （可选）填充初始数据
npx prisma db seed
```

---

### 7. 配置自定义域名（可选）

1. 将域名 DNS 转移到 Cloudflare
2. 在 Cloudflare Pages 项目中添加自定义域名
3. 等待 SSL 证书自动签发
4. 配置域名重定向规则（www → 主域名）

---

## 🔍 部署后验证清单

### 前台功能
- [ ] 首页正常加载
- [ ] 多语言切换正常
- [ ] 商品列表显示正常
- [ ] 商品详情页正常
- [ ] 购物车功能正常
- [ ] 用户注册/登录正常
- [ ] 订单创建正常

### 后台功能
- [ ] 访问 `/zh/admin` 管理后台
- [ ] 管理员登录正常
- [ ] 商品列表加载正常
- [ ] **图片上传功能正常（重要！）**
- [ ] 创建商品正常
- [ ] 编辑商品正常
- [ ] 删除商品正常
- [ ] 订单管理正常

### 性能测试
- [ ] 使用 PageSpeed Insights 测试
- [ ] 使用 GTmetrix 测试
- [ ] 测试全球访问速度

---

## ⚠️ 常见问题排查

### 问题1：构建失败
**查看构建日志** → Cloudflare Pages 项目页面 → 点击失败的部署

常见原因：
- 环境变量配置错误
- 依赖安装失败
- TypeScript 类型错误

### 问题2：图片上传失败
检查：
- R2/S3 配置是否正确
- Access Key 是否有效
- Bucket 公开访问权限是否设置
- CORS 配置是否正确

### 问题3：数据库连接失败
检查：
- `DATABASE_URL` 是否正确
- 数据库是否已创建
- 网络连接是否正常
- 是否运行了数据库迁移

### 问题4：页面加载慢
优化建议：
- 启用 Cloudflare CDN（自动）
- 配置缓存规则
- 开启 Brotli 压缩
- 启用 HTTP/3
- 使用 Cloudflare Images 优化图片

---

## 💡 重要提醒

1. **不要将 `.env` 文件提交到 Git**
   - 已在 `.gitignore` 中排除
   - 使用 `.env.example` 作为参考模板

2. **生产环境必须使用云存储**
   - Cloudflare Pages 不支持本地文件存储
   - 必须配置 R2 或 S3

3. **数据库必须使用 PostgreSQL 或 MySQL**
   - Cloudflare Pages 不支持 SQLite
   - 推荐使用 Supabase 或 Neon

4. **定期备份数据**
   - 设置数据库自动备份
   - 导出重要数据

5. **监控和日志**
   - 使用 Cloudflare Analytics
   - 配置错误告警
   - 定期检查日志

---

## 📚 相关文档

- [完整部署指南](./CLOUDFLARE_DEPLOYMENT.md)
- [用户手册](./USER_MANUAL.md)
- [技术设计文档](./TECHNICAL_DESIGN.md)

---

## 🆘 获取帮助

- Cloudflare 支持: https://support.cloudflare.com/
- Cloudflare 社区: https://community.cloudflare.com/
- Cloudflare Pages 文档: https://developers.cloudflare.com/pages/

---

**准备好了吗？开始部署吧！** 🚀

记得按照清单逐项检查，确保所有配置都正确完成。

