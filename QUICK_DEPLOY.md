# ⚡ 快速部署指南

5分钟快速部署到 Cloudflare Pages！

---

## 🎯 部署前准备（5分钟）

### 1️⃣ 注册必要账号

- ✅ [GitHub](https://github.com) - 代码托管
- ✅ [Cloudflare](https://dash.cloudflare.com) - 部署平台（免费）
- ✅ [Supabase](https://supabase.com) - 数据库（免费 500MB）

### 2️⃣ 修改数据库配置

编辑 `prisma/schema.prisma` 第6行：

```prisma
datasource db {
  provider = "postgresql"  # 从 "sqlite" 改为 "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3️⃣ 推送代码到 GitHub

```bash
git init
git add .
git commit -m "准备部署"
git remote add origin https://github.com/你的用户名/jade-gems.git
git push -u origin main
```

---

## 🚀 部署步骤（3分钟）

### 步骤 1: 创建 Supabase 数据库

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息，等待创建完成
4. 进入 Settings → Database → 复制 "Connection string" (URI)
5. 将 `[YOUR-PASSWORD]` 替换为你设置的密码

### 步骤 2: 创建 Cloudflare R2 存储

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单 → R2 → Create bucket
3. Bucket 名称: `jade-gems-uploads`
4. Manage R2 API Tokens → Create API token
5. 权限: Object Read & Write
6. 记录生成的信息（只显示一次！）

### 步骤 3: 部署到 Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create application
2. 选择 "Pages" → "Connect to Git"
3. 授权 GitHub 并选择 `jade-gems` 仓库
4. 配置构建设置:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Build output**: `.next`

5. 添加环境变量（点击 "Add variable"）:

```env
DATABASE_URL=你的Supabase连接字符串
JWT_SECRET=随机生成一个长字符串
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=你的管理员密码
R2_ENDPOINT=你的R2_Endpoint
R2_BUCKET_NAME=jade-gems-uploads
R2_ACCESS_KEY_ID=你的Access_Key_ID
R2_SECRET_ACCESS_KEY=你的Secret_Access_Key
R2_PUBLIC_URL=你的R2_Public_URL
```

6. 点击 "Save and Deploy"

### 步骤 4: 初始化数据库

部署成功后，在本地运行：

```bash
# 设置数据库连接
export DATABASE_URL="你的Supabase连接字符串"

# 运行迁移
npx prisma migrate deploy

# （可选）填充测试数据
npx prisma db seed
```

---

## ✅ 完成！

访问 Cloudflare 提供的 URL（如 `https://jade-gems.pages.dev`）查看你的网站！

- 前台: `https://你的域名.pages.dev`
- 后台: `https://你的域名.pages.dev/zh/admin`

---

## 🔧 常见问题

### Q: 构建失败？
**A**: 查看构建日志，通常是环境变量配置错误

### Q: 图片上传失败？
**A**: 检查 R2 配置，确保所有环境变量都正确设置

### Q: 数据库连接失败？
**A**: 确认 DATABASE_URL 正确，并且已运行数据库迁移

### Q: 需要花钱吗？
**A**: 
- Cloudflare Pages: **免费**（无限带宽）
- Supabase: **免费** 500MB 数据库
- R2: **免费** 10GB 存储
- 总成本: **完全免费！**

---

## 📚 更多资源

- [完整部署指南](CLOUDFLARE_DEPLOYMENT.md) - 详细的步骤说明
- [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 部署前必读
- [用户手册](USER_MANUAL.md) - 功能使用说明
- [技术文档](TECHNICAL_DESIGN.md) - 技术架构详解

---

## 💡 下一步

部署成功后建议：

1. ✅ 修改管理员密码
2. ✅ 配置自定义域名
3. ✅ 上传商品数据
4. ✅ 测试支付功能
5. ✅ 配置 SSL 证书（自动）

---

**部署愉快！** 🎉

有问题？查看 [完整部署指南](CLOUDFLARE_DEPLOYMENT.md) 或提交 [Issue](https://github.com/yourusername/jade-gems/issues)。

