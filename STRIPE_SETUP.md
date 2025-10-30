# 🚀 Stripe 支付快速配置

## ⚠️ 当前状态

您的项目缺少 Stripe 支付配置，导致结账功能报错：

```
Missing STRIPE_SECRET_KEY or NEXT_PUBLIC_SITE_URL
```

## 🎯 解决方案

### 推荐：使用 Stripe（支持国内外支付）

**Stripe 原生支持：**
- 🌍 国际信用卡（Visa、MasterCard、American Express）
- 🇨🇳 支付宝（Alipay）
- 🇨🇳 微信支付（WeChat Pay）
- 📱 Apple Pay、Google Pay

**优势：**
- ✅ 您的代码已集成 Stripe，只需配置即可使用
- ✅ 一套代码支持所有支付方式
- ✅ 安全可靠，国际一流支付平台
- ✅ 文档完善，易于维护

---

## 📝 5 分钟快速配置

### 第 1 步：注册 Stripe

访问 https://stripe.com/ 并注册账户（免费）

### 第 2 步：获取 API 密钥

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 点击右上角 **Developers** → **API keys**
3. 复制 **Secret key**（点击 "Reveal test key" 显示）

### 第 3 步：创建配置文件

在项目根目录创建 `.env.local` 文件：

```bash
cd /Users/songhaonan/myFile/玉石网站/jade-gems
touch .env.local
```

粘贴以下内容（**替换实际值**）：

```bash
# 数据库配置（保持您现有的配置）
DATABASE_URL="你现有的数据库URL"
DIRECT_URL="你现有的直连URL"

# Stripe 配置（从 Stripe Dashboard 复制）
STRIPE_SECRET_KEY="sk_test_你的stripe密钥"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_你的stripe公钥"

# 网站 URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 管理员邮箱
ADMIN_EMAILS="song@demo.com"
```

### 第 4 步：重启服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 第 5 步：测试支付

1. 访问 http://localhost:3000
2. 添加商品到购物车
3. 点击 **去结账**
4. 应该会跳转到 Stripe Checkout 页面 ✅

---

## 🧪 Stripe 测试卡号

支付测试使用以下卡号（不会真实扣款）：

```
卡号：4242 4242 4242 4242
到期日期：任意未来日期（如 12/34）
CVV：任意 3 位数字（如 123）
```

---

## 📚 详细文档

- [Stripe 支付配置指南](./docs/Stripe支付配置指南.md) - 完整的 Stripe 配置教程
- [环境变量配置](./docs/环境变量配置.md) - 环境变量详细说明

---

## 💡 其他支付方案

如果您希望使用其他支付方式，可以考虑：

### 方案 2：Stripe + Pingxx（国内聚合支付）
- 国际用户：Stripe
- 国内用户：Pingxx（支付宝、微信、银联）
- 需要维护两套支付逻辑

### 方案 3：仅国内支付
- 使用 Pingxx、Xpay 等国内聚合支付平台
- 需要重写支付代码

---

**建议：先使用 Stripe 完成开发和测试，如有特殊需求再考虑其他方案。**

有任何问题欢迎随时询问！🎉

