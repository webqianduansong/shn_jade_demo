# 🚀 Stripe 支付配置指南

## 📋 目录
1. [为什么选择 Stripe](#为什么选择-stripe)
2. [Stripe 注册与配置](#stripe-注册与配置)
3. [环境变量配置](#环境变量配置)
4. [启用支付宝和微信支付](#启用支付宝和微信支付)
5. [测试支付流程](#测试支付流程)
6. [生产环境部署](#生产环境部署)

---

## 🌟 为什么选择 Stripe

### ✅ 优势
- **已集成**：项目代码已经使用 Stripe
- **支持国内外**：原生支持支付宝、微信支付、信用卡
- **统一接口**：一套代码管理所有支付方式
- **安全可靠**：PCI DSS Level 1 认证
- **文档完善**：国际一流支付平台

### 💳 Stripe 支持的支付方式
- 🌍 **国际**：Visa、MasterCard、American Express、Apple Pay、Google Pay
- 🇨🇳 **中国**：**支付宝（Alipay）**、**微信支付（WeChat Pay）**
- 🇯🇵 **日本**：JCB、Konbini
- 🇪🇺 **欧洲**：SEPA、iDEAL、Bancontact

### 💰 费率
- 国际信用卡：2.9% + $0.30 每笔
- 支付宝/微信支付：3.4% + $0.30 每笔

---

## 🔧 Stripe 注册与配置

### 第 1 步：注册 Stripe 账户

1. 访问：https://stripe.com/
2. 点击 **Sign up**（注册）
3. 填写邮箱和密码
4. 选择账户类型（个人或企业）
5. 完成邮箱验证

### 第 2 步：获取 API 密钥

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 点击右上角 **Developers**（开发者）
3. 点击 **API keys**（API 密钥）
4. 您会看到两个密钥：
   - **Publishable key**（可发布密钥）：`pk_test_xxx`
   - **Secret key**（密钥）：`sk_test_xxx`（点击 **Reveal test key** 显示）

⚠️ **重要**：
- 测试环境使用 `sk_test_xxx` 开头的密钥
- 生产环境使用 `sk_live_xxx` 开头的密钥
- **Secret key 绝对不能泄露**，不要提交到 Git

---

## ⚙️ 环境变量配置

### 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（如果已存在则编辑）：

```bash
# ===================================
# 数据库配置
# ===================================
DATABASE_URL="你的数据库连接字符串"
DIRECT_URL="你的数据库直连字符串"

# ===================================
# Stripe 支付配置
# ===================================
# Stripe Secret Key（从 Stripe Dashboard 复制）
STRIPE_SECRET_KEY="sk_test_你的stripe密钥"

# Stripe Publishable Key（前端使用，可选）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_你的stripe公钥"

# Stripe Webhook Secret（配置 Webhook 后获取）
STRIPE_WEBHOOK_SECRET="whsec_你的webhook密钥"

# ===================================
# 网站配置
# ===================================
# 网站完整 URL（用于支付回调）
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# ===================================
# 管理员配置
# ===================================
ADMIN_EMAILS="song@demo.com"
```

### 配置步骤

1. **复制您的 Stripe Secret Key**：
   - 从 Stripe Dashboard → Developers → API keys
   - 复制 **Secret key**（sk_test_xxx）
   - 粘贴到 `STRIPE_SECRET_KEY`

2. **设置网站 URL**：
   - 本地开发：`http://localhost:3000`
   - 生产环境：`https://yourdomain.com`

3. **保存文件**

---

## 🎯 启用支付宝和微信支付

### 第 1 步：启用支付方式

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 点击 **Settings**（设置）→ **Payment methods**（支付方式）
3. 找到并启用：
   - ✅ **Alipay**（支付宝）
   - ✅ **WeChat Pay**（微信支付）
   - ✅ **Card**（信用卡/借记卡）

### 第 2 步：配置 Alipay（支付宝）

1. 点击 **Alipay** → **Enable**
2. 完成业务信息填写（测试环境可跳过）
3. 保存设置

### 第 3 步：配置 WeChat Pay（微信支付）

1. 点击 **WeChat Pay** → **Enable**
2. 完成业务信息填写（测试环境可跳过）
3. 保存设置

⚠️ **注意**：
- 测试环境下，Stripe 提供模拟的支付宝和微信支付
- 生产环境需要完成企业认证和合规审核

---

## 🧪 测试支付流程

### 1. 启动项目

```bash
cd /Users/songhaonan/myFile/玉石网站/jade-gems
npm run dev
```

### 2. 测试结账流程

1. 访问：http://localhost:3000
2. 添加商品到购物车
3. 点击 **去结账**
4. 应该会跳转到 Stripe Checkout 页面

### 3. Stripe 测试卡号

使用以下测试卡号进行支付测试：

#### ✅ 成功支付
```
卡号：4242 4242 4242 4242
到期日期：任意未来日期（如 12/34）
CVV：任意 3 位数字（如 123）
邮编：任意邮编（如 12345）
```

#### ❌ 失败支付（余额不足）
```
卡号：4000 0000 0000 9995
到期日期：任意未来日期
CVV：任意 3 位数字
```

#### 💳 需要 3D 验证
```
卡号：4000 0027 6000 3184
到期日期：任意未来日期
CVV：任意 3 位数字
```

### 4. 查看测试结果

- 支付成功后会跳转到 `/success` 页面
- 在 Stripe Dashboard → **Payments** 查看所有交易记录
- 测试环境的订单不会真实扣款

---

## 🚀 生产环境部署

### 第 1 步：激活 Stripe 账户

1. 登录 Stripe Dashboard
2. 点击 **Activate your account**（激活账户）
3. 完成以下信息：
   - 公司/个人信息
   - 银行账户信息
   - 身份验证（上传身份证/护照）

### 第 2 步：获取生产环境密钥

1. 在 Stripe Dashboard 右上角切换到 **Live mode**（生产模式）
2. 前往 **Developers** → **API keys**
3. 复制生产环境密钥：
   - `sk_live_xxx`（Secret key）
   - `pk_live_xxx`（Publishable key）

### 第 3 步：更新 Vercel 环境变量

在 Vercel 项目设置中添加生产环境变量：

```bash
STRIPE_SECRET_KEY=sk_live_你的生产密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_你的生产公钥
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 第 4 步：配置 Webhook（重要）

Webhook 用于接收 Stripe 的支付状态回调（如支付成功、支付失败）。

1. 在 Stripe Dashboard → **Developers** → **Webhooks**
2. 点击 **Add endpoint**（添加端点）
3. 输入 Webhook URL：
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
4. 选择要监听的事件：
   - `checkout.session.completed`（结账完成）
   - `payment_intent.succeeded`（支付成功）
   - `payment_intent.payment_failed`（支付失败）
5. 复制 **Signing secret**（whsec_xxx）
6. 添加到环境变量：
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_你的webhook密钥
   ```

---

## 📊 当前支付流程

### 用户侧流程

```
用户购物车
    ↓
点击"去结账"
    ↓
跳转到 Stripe Checkout 页面
（自动显示：信用卡、支付宝、微信支付）
    ↓
用户选择支付方式并完成支付
    ↓
支付成功 → 跳转到 /success
支付失败 → 跳转到 /cancel
```

### 后端流程

```
前端调用 POST /api/checkout
    ↓
验证用户登录状态
    ↓
从数据库查询商品信息
    ↓
计算订单金额（商品 + 运费）
    ↓
创建 Stripe Checkout Session
    ↓
在数据库创建订单（状态：PENDING）
    ↓
返回 Stripe Checkout URL
    ↓
（支付成功后）Stripe 调用 Webhook
    ↓
更新订单状态为 PAID
```

---

## 🔍 常见问题

### Q1: 如何测试支付宝和微信支付？

**A**: 在 Stripe 测试环境下：
1. 确保已在 Dashboard 启用 Alipay 和 WeChat Pay
2. 在 Checkout 页面选择 Alipay 或 WeChat Pay
3. Stripe 会显示一个模拟的支付页面
4. 点击 "Authorize Test Payment" 即可完成测试

### Q2: 生产环境需要企业认证吗？

**A**: 是的，支付宝和微信支付需要：
- 完成 Stripe 账户激活
- 提供企业营业执照（或个体工商户）
- 通过 Stripe 的合规审核

### Q3: 支付成功后如何更新订单状态？

**A**: 需要配置 Webhook：
1. Stripe 支付成功后会调用您的 Webhook URL
2. 您需要在 `/api/stripe/webhook` 处理回调
3. 验证签名后更新订单状态为 `PAID`

### Q4: 如何查看支付记录？

**A**: 
- Stripe Dashboard → **Payments** 查看所有交易
- 您的数据库 `Order` 表查看订单记录

### Q5: 费用如何结算？

**A**:
- Stripe 会自动扣除手续费
- 剩余金额会在 2-7 个工作日内转入您的银行账户
- 可在 Dashboard → **Balance** 查看余额

---

## 📚 相关文档

- [Stripe 官方文档](https://stripe.com/docs)
- [Stripe Checkout 文档](https://stripe.com/docs/payments/checkout)
- [Stripe 支付宝文档](https://stripe.com/docs/payments/alipay)
- [Stripe 微信支付文档](https://stripe.com/docs/payments/wechat-pay)
- [Stripe Webhook 文档](https://stripe.com/docs/webhooks)

---

## 🆘 需要帮助？

如果遇到问题，请检查：
1. ✅ `.env.local` 文件是否正确配置
2. ✅ Stripe Dashboard 是否启用了对应的支付方式
3. ✅ 环境变量是否重启项目后生效
4. ✅ 浏览器控制台是否有报错信息

---

**祝支付接入顺利！** 🎉

