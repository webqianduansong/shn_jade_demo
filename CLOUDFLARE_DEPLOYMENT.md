# Cloudflare Pages 部署指南

## 📋 目录
- [前置准备](#前置准备)
- [数据库配置](#数据库配置)
- [图片存储配置](#图片存储配置)
- [项目配置修改](#项目配置修改)
- [部署到Cloudflare](#部署到cloudflare)
- [域名配置](#域名配置)
- [常见问题](#常见问题)

---

## 前置准备

### 需要准备的账号

1. **GitHub账号** - 用于代码托管
2. **Cloudflare账号** - 用于部署和CDN（免费）
3. **数据库服务** - 推荐以下之一：
   - [Supabase](https://supabase.com/) - 免费500MB PostgreSQL
   - [Neon](https://neon.tech/) - 免费3GB PostgreSQL
   - [PlanetScale](https://planetscale.com/) - 免费5GB MySQL
4. **图片存储** - 推荐以下之一：
   - [Cloudflare R2](https://www.cloudflare.com/) - 10GB免费存储
   - [AWS S3](https://aws.amazon.com/s3/) - 5GB免费（12个月）
   - [Backblaze B2](https://www.backblaze.com/b2/) - 10GB免费

### 为什么需要这些服务？

**数据库**：
- Cloudflare Pages是无服务器环境，不能使用本地SQLite
- 需要使用云端数据库（PostgreSQL或MySQL）

**图片存储**：
- Cloudflare Pages不支持持久化文件存储
- 上传的图片需要保存到对象存储服务

---

## 数据库配置

### 方案一：使用Supabase（推荐）

#### 1. 注册Supabase

访问 [https://supabase.com](https://supabase.com) 注册账号

#### 2. 创建项目

1. 点击"New Project"
2. 填写项目信息：
   - **Name**: jade-gems
   - **Database Password**: 设置一个强密码（保存好）
   - **Region**: 选择离中国最近的区域
     - 优先选择：Singapore / Tokyo / Hong Kong
     - 如果没有亚洲区域，选择 US West 也可以
3. 点击"Create new project"
4. 等待1-2分钟项目创建完成

#### 3. 获取数据库连接字符串

1. 在项目页面，点击左侧 "Settings" → "Database"
2. 找到 "Connection string" 部分
3. 选择 "URI" 标签
4. 复制连接字符串，格式类似：
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 方案二：使用Neon

#### 1. 注册Neon

访问 [https://neon.tech](https://neon.tech) 注册账号

#### 2. 创建项目

1. 点击"Create a project"
2. 项目会自动创建
3. 复制显示的数据库连接字符串

#### 3. 保存连接信息

连接字符串格式：
```
postgresql://[user]:[password]@[host]/[database]
```

---

## 图片存储配置

### 方案一：使用Cloudflare R2（推荐）

#### 1. 开启R2服务

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在左侧菜单找到 "R2"
3. 点击"Create bucket"
4. Bucket名称：`jade-gems-uploads`
5. 点击"Create bucket"

#### 2. 创建API Token

1. 在R2页面，点击"Manage R2 API Tokens"
2. 点击"Create API token"
3. 权限选择：Object Read & Write
4. 点击"Create API Token"
5. **重要**：保存以下信息（只显示一次）：
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

#### 3. 配置公开访问

1. 进入你的bucket
2. 点击"Settings"
3. 找到"Public access"
4. 点击"Allow Access"
5. 记录Public URL

### 方案二：使用AWS S3

#### 1. 创建S3 Bucket

1. 登录AWS Console
2. 搜索并进入S3服务
3. 点击"Create bucket"
4. 配置：
   - **Bucket name**: jade-gems-uploads
   - **Region**: 选择离用户近的区域
   - **Block Public Access**: 取消勾选（允许公开访问）
5. 创建bucket

#### 2. 配置CORS

在bucket设置中添加CORS规则：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

#### 3. 创建IAM用户

1. 进入IAM服务
2. 创建新用户，附加S3权限
3. 生成Access Key
4. 保存Access Key ID和Secret Access Key

---

## 项目配置修改

### 1. 修改Prisma配置

编辑 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"  // 从 sqlite 改为 postgresql
  url      = env("DATABASE_URL")
}
```

### 2. 创建图片上传适配器

创建 `src/lib/uploadAdapter.ts`：

```typescript
// 图片上传适配器 - 支持R2和S3

export interface UploadAdapter {
  upload(file: File, filename: string): Promise<string>;
  delete(url: string): Promise<void>;
}

// Cloudflare R2适配器
export class R2Adapter implements UploadAdapter {
  private endpoint: string;
  private bucketName: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private publicUrl: string;

  constructor() {
    this.endpoint = process.env.R2_ENDPOINT!;
    this.bucketName = process.env.R2_BUCKET_NAME!;
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID!;
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;
  }

  async upload(file: File, filename: string): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    const buffer = await file.arrayBuffer();
    
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: Buffer.from(buffer),
        ContentType: file.type,
      })
    );

    return `${this.publicUrl}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    // 实现删除逻辑
  }
}

// 获取当前配置的适配器
export function getUploadAdapter(): UploadAdapter {
  return new R2Adapter();
}
```

### 3. 修改上传API

编辑 `src/app/api/admin/upload/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUploadAdapter } from '@/lib/uploadAdapter';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    // 验证文件
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件过大' }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;

    // 使用适配器上传
    const adapter = getUploadAdapter();
    const url = await adapter.upload(file, filename);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
```

### 4. 安装必要依赖

```bash
npm install @aws-sdk/client-s3
```

### 5. 更新package.json

确保构建脚本正确：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postbuild": "prisma generate"
  }
}
```

### 6. 创建next.config.js配置

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'pub-xxxxx.r2.dev', // 替换为你的R2公开域名
      's3.amazonaws.com',  // 如果使用S3
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
}

module.exports = nextConfig
```

---

## 部署到Cloudflare

### 步骤1: 将代码推送到GitHub

#### 1. 初始化Git仓库（如果还没有）

```bash
cd /Users/songhaonan/myFile/玉石网站/jade-gems
git init
git add .
git commit -m "Initial commit"
```

#### 2. 创建GitHub仓库

1. 访问 [https://github.com/new](https://github.com/new)
2. 仓库名称：`jade-gems`
3. 选择 Private（私有）或 Public（公开）
4. 不要初始化README
5. 点击"Create repository"

#### 3. 推送代码

```bash
git remote add origin https://github.com/你的用户名/jade-gems.git
git branch -M main
git push -u origin main
```

### 步骤2: 在Cloudflare创建项目

#### 1. 登录Cloudflare

访问 [https://dash.cloudflare.com](https://dash.cloudflare.com)

#### 2. 创建Pages项目

1. 在左侧菜单点击 "Workers & Pages"
2. 点击 "Create application"
3. 选择 "Pages" 标签
4. 点击 "Connect to Git"

#### 3. 连接GitHub

1. 授权Cloudflare访问你的GitHub
2. 选择 `jade-gems` 仓库
3. 点击 "Begin setup"

#### 4. 配置构建设置

**Build settings**:
- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (默认)

**Environment variables** (点击"Add variable"添加):

```env
# 数据库
DATABASE_URL=postgresql://postgres:[密码]@[主机]:5432/postgres

# JWT密钥（生成一个随机字符串）
JWT_SECRET=your-super-secret-key-change-this

# 管理员账号
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# R2配置（如使用R2）
R2_ENDPOINT=https://[账户ID].r2.cloudflarestorage.com
R2_BUCKET_NAME=jade-gems-uploads
R2_ACCESS_KEY_ID=你的Access Key ID
R2_SECRET_ACCESS_KEY=你的Secret Access Key
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# 如使用S3
# AWS_S3_BUCKET=jade-gems-uploads
# AWS_S3_REGION=ap-southeast-1
# AWS_ACCESS_KEY_ID=你的Access Key ID
# AWS_SECRET_ACCESS_KEY=你的Secret Access Key
```

#### 5. 开始部署

1. 点击 "Save and Deploy"
2. 等待构建完成（通常3-5分钟）
3. 构建成功后会显示部署URL

### 步骤3: 初始化数据库

#### 方法一：本地运行迁移（推荐）

```bash
# 1. 在本地设置生产数据库URL
export DATABASE_URL="postgresql://..."

# 2. 运行迁移
npx prisma migrate deploy

# 3. （可选）运行种子数据
npx prisma db seed
```

#### 方法二：使用Prisma Studio

```bash
# 连接到生产数据库
DATABASE_URL="postgresql://..." npx prisma studio
```

---

## 域名配置

### 步骤1: 将域名转入Cloudflare DNS

#### 1. 添加站点到Cloudflare

1. 在Cloudflare Dashboard点击"Add a site"
2. 输入你的域名：`yourdomain.com`
3. 选择免费计划
4. 点击"Continue"

#### 2. 修改域名NS记录

Cloudflare会显示两个Nameserver，例如：
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**在阿里云修改NS记录**：

1. 登录阿里云控制台
2. 进入"域名管理"
3. 找到你的域名，点击"管理"
4. 点击"DNS修改"
5. 选择"修改DNS服务器"
6. 将NS服务器改为Cloudflare提供的两个地址
7. 保存

⚠️ **注意**：NS修改需要24-48小时生效

#### 3. 等待DNS生效

回到Cloudflare，点击"Done, check nameservers"

### 步骤2: 绑定自定义域名到Pages

#### 1. 进入Pages项目

1. 在Cloudflare Dashboard，进入 "Workers & Pages"
2. 点击你的 `jade-gems` 项目

#### 2. 添加自定义域名

1. 点击 "Custom domains" 标签
2. 点击 "Set up a custom domain"
3. 输入你的域名，例如：
   - `yourdomain.com` (主域名)
   - `www.yourdomain.com` (www子域名)
4. 点击 "Continue"
5. Cloudflare会自动创建DNS记录
6. 点击 "Activate domain"

#### 3. 配置SSL

1. 在域名管理页面，点击 "SSL/TLS"
2. 选择 "Full (strict)" 模式
3. 等待SSL证书自动签发（通常几分钟）

### 步骤3: 配置重定向（可选）

让 www 域名重定向到主域名：

1. 在Cloudflare Dashboard，选择你的域名
2. 点击 "Rules" → "Page Rules"
3. 点击 "Create Page Rule"
4. 配置：
   - URL: `www.yourdomain.com/*`
   - Setting: "Forwarding URL" - 301 Permanent Redirect
   - Destination: `https://yourdomain.com/$1`
5. 保存

---

## 验证部署

### 1. 访问测试

打开浏览器，访问你的域名：
```
https://yourdomain.com
```

### 2. 功能测试

**前台测试**：
- ✅ 首页加载
- ✅ 切换语言
- ✅ 浏览商品
- ✅ 查看商品详情
- ✅ 加入购物车

**后台测试**：
- ✅ 访问 `https://yourdomain.com/zh/admin`
- ✅ 管理员登录
- ✅ 查看商品列表
- ✅ 上传商品图片
- ✅ 创建/编辑商品

### 3. 性能测试

访问以下工具测试网站性能：
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

---

## 常见问题

### Q1: 构建失败怎么办？

**查看构建日志**：
1. 在Cloudflare Pages项目页面
2. 点击失败的部署
3. 查看详细日志

**常见错误**：

**错误1**: `Prisma Client not generated`
```bash
# 解决：在 package.json 添加
"postinstall": "prisma generate"
```

**错误2**: `Database connection failed`
```bash
# 解决：检查 DATABASE_URL 环境变量是否正确
```

**错误3**: `Module not found`
```bash
# 解决：确保所有依赖都在 package.json 中
npm install
```

### Q2: 图片上传失败？

**检查清单**：
1. R2/S3配置是否正确
2. Access Key是否有效
3. Bucket权限是否正确
4. CORS配置是否正确

**调试方法**：
查看浏览器控制台和Cloudflare日志

### Q3: 数据库连接超时？

**原因**：
- Cloudflare Workers有30秒执行限制
- 数据库地理位置太远

**解决方案**：
1. 使用距离较近的数据库区域
2. 优化数据库查询
3. 添加连接池配置

### Q4: 域名未备案可以访问吗？

**答案**：可以！

**原因**：
- Cloudflare的服务器在海外
- 不受中国大陆备案政策限制
- 全球用户都可以访问

**注意**：
- 国内访问速度可能较慢（可用CDN优化）
- 如果需要在国内快速访问，建议使用国内CDN并备案

### Q5: 如何更新网站？

**方法**：
1. 修改代码
2. 提交并推送到GitHub：
```bash
git add .
git commit -m "更新说明"
git push
```
3. Cloudflare会自动检测并重新部署

### Q6: 如何回滚版本？

1. 在Cloudflare Pages项目页面
2. 点击 "Deployments"
3. 找到之前成功的部署
4. 点击 "..." → "Rollback to this deployment"

### Q7: 免费配额够用吗？

**Cloudflare Pages免费版**：
- ✅ 无限带宽
- ✅ 500次构建/月
- ✅ 无限静态请求
- ✅ 100,000次动态请求/天

**对于个人/小型项目完全够用！**

### Q8: 如何设置环境变量？

1. 进入Pages项目
2. 点击 "Settings" → "Environment variables"
3. 添加/修改变量
4. 点击 "Save"
5. 触发重新部署（推送代码或手动重新部署）

### Q9: 如何查看日志？

**实时日志**：
1. 在Cloudflare Dashboard
2. 点击 "Workers & Pages"
3. 选择你的项目
4. 点击 "Logs" 标签

**也可以使用Wrangler CLI**：
```bash
npm install -g wrangler
wrangler pages deployment tail
```

### Q10: 成本预估

**完全免费方案**：
- Cloudflare Pages: 免费
- Supabase: 免费500MB
- Cloudflare R2: 免费10GB
- 域名：约50-100元/年（已有）

**总成本**: 约**50-100元/年**（仅域名费用）

---

## 优化建议

### 1. 启用CDN加速

Cloudflare自带全球CDN，自动启用

### 2. 配置缓存规则

在Cloudflare中设置缓存规则：
- 静态资源（图片、CSS、JS）：缓存1个月
- HTML：缓存1小时
- API：不缓存

### 3. 开启Brotli压缩

在Cloudflare Dashboard：
1. 选择域名
2. Speed → Optimization
3. 开启 Brotli

### 4. 启用HTTP/3

1. 选择域名
2. Network → HTTP/3
3. 开启

### 5. 图片优化

使用Cloudflare Images或Cloudinary：
- 自动WebP转换
- 自动调整大小
- 智能压缩

---

## 下一步

部署成功后，建议：

1. ✅ 配置域名邮箱（用于发送订单确认）
2. ✅ 设置监控告警（Cloudflare Analytics）
3. ✅ 配置备份策略（定期备份数据库）
4. ✅ 添加Google Analytics（网站分析）
5. ✅ 配置Sentry（错误监控）
6. ✅ 设置定时任务（清理过期订单等）

---

## 技术支持

遇到问题？

- 📧 Cloudflare支持: [https://support.cloudflare.com/](https://support.cloudflare.com/)
- 💬 社区论坛: [https://community.cloudflare.com/](https://community.cloudflare.com/)
- 📚 文档: [https://developers.cloudflare.com/pages/](https://developers.cloudflare.com/pages/)

---

**祝部署顺利！** 🚀

如有任何问题，欢迎提Issue或联系我们。

