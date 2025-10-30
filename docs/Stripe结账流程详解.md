# 🔄 Stripe Checkout 结账流程详解

## 📋 完整流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户在购物车页面                          │
│                     点击 "去结账" 按钮                           │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 1 步：前端发起请求 (CartClient.tsx)                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  函数: handleCheckout()                                          │
│  文件: src/components/CartClient.tsx (第 33 行)                  │
│                                                                   │
│  1.1 检查用户登录状态                                            │
│      → 调用 GET /api/auth/me                                     │
│      → 未登录 → 跳转到登录页                                     │
│                                                                   │
│  1.2 转换数据格式                                                │
│      const lineItems = items.map(item => ({                      │
│        id: item.productId,        // 商品ID                      │
│        quantity: item.quantity    // 数量                        │
│      }));                                                         │
│                                                                   │
│  1.3 发送请求                                                    │
│      POST /api/checkout                                           │
│      Body: { lineItems: [...] }                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 2 步：后端处理请求 (checkout/route.ts)                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  文件: src/app/api/checkout/route.ts                             │
│                                                                   │
│  2.1 验证用户身份 (第 10-13 行)                                  │
│      const user = await getAuthUser();                           │
│      if (!user) return 401;                                      │
│                                                                   │
│  2.2 检查环境变量 (第 20-38 行)                                  │
│      - STRIPE_SECRET_KEY                                         │
│      - NEXT_PUBLIC_SITE_URL                                      │
│      缺少 → 返回友好错误提示                                     │
│                                                                   │
│  2.3 从数据库查询商品信息 (第 41-43 行)                          │
│      const dbProducts = await prisma.product.findMany({          │
│        where: { id: { in: [商品ID列表] } }                       │
│      });                                                          │
│                                                                   │
│  2.4 构建 Stripe 订单项 (第 45-58 行)                            │
│      items.push({                                                 │
│        price_data: {                                              │
│          currency: 'usd',                                         │
│          product_data: { name: product.name },                   │
│          unit_amount: product.price  // 分为单位                 │
│        },                                                         │
│        quantity: li.quantity                                      │
│      });                                                          │
│                                                                   │
│  2.5 计算订单金额 (第 64-72 行)                                  │
│      - subtotalCents: 商品小计（分）                             │
│      - shippingCents: 运费（满$100免运费，否则$4.44）           │
│      - totalCents: 订单总额                                       │
│                                                                   │
│  2.6 创建 Stripe Checkout Session (第 78-94 行)                  │
│      const session = await stripe.checkout.sessions.create({     │
│        mode: 'payment',                                           │
│        line_items: items,                                         │
│        payment_method_types: [                                    │
│          'card',        // 信用卡                                │
│          'alipay',      // 支付宝                                │
│          'wechat_pay'   // 微信支付                              │
│        ],                                                         │
│        success_url: `${siteUrl}/success?session_id={...}`,       │
│        cancel_url: `${siteUrl}/cancel`,                          │
│        customer_email: user.email,                               │
│        metadata: { userId, userEmail }                           │
│      });                                                          │
│                                                                   │
│  2.7 在数据库创建订单草稿 (第 96-113 行)                         │
│      await prisma.order.create({                                 │
│        data: {                                                    │
│          userId,                                                  │
│          orderNo,         // 唯一订单号                          │
│          status: 'PENDING',                                       │
│          shippingAddress: {...},                                  │
│          subtotalCents,                                           │
│          shippingCents,                                           │
│          totalCents,                                              │
│          paymentMethod: 'stripe',                                │
│          paymentRef: session.id,  // 关联 Stripe Session         │
│          items: { create: [...] }                                │
│        }                                                          │
│      });                                                          │
│                                                                   │
│  2.8 返回 Stripe Checkout URL (第 115 行)                        │
│      return { id: session.id, url: session.url };                │
│      // url 示例: "https://checkout.stripe.com/c/pay/cs_xxx"    │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 3 步：前端接收响应并跳转 (CartClient.tsx)                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  文件: src/components/CartClient.tsx (第 61-68 行)               │
│                                                                   │
│  3.1 检查响应                                                    │
│      if (response.ok && data.url) { ... }                        │
│                                                                   │
│  3.2 浏览器跳转到 Stripe                                         │
│      window.location.href = data.url;                            │
│      ↓                                                            │
│      浏览器地址栏变为:                                           │
│      https://checkout.stripe.com/c/pay/cs_xxxxx                  │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 4 步：用户在 Stripe Checkout 页面完成支付                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                   │
│  Stripe 自动展示可用的支付方式：                                 │
│  ┌─────────────────────────────────────┐                        │
│  │  💳 Card (信用卡/借记卡)            │                        │
│  ├─────────────────────────────────────┤                        │
│  │  🇨🇳 Alipay (支付宝)                │                        │
│  ├─────────────────────────────────────┤                        │
│  │  🇨🇳 WeChat Pay (微信支付)          │                        │
│  └─────────────────────────────────────┘                        │
│                                                                   │
│  用户选择支付方式并完成支付                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
                  ┌────────┴────────┐
                  │                 │
           支付成功              支付失败/取消
                  │                 │
                  ↓                 ↓
    ┌──────────────────┐  ┌──────────────────┐
    │  跳转到成功页面  │  │  跳转到取消页面  │
    │  /success        │  │  /cancel         │
    └──────────────────┘  └──────────────────┘
```

---

## 💻 关键代码解析

### 1️⃣ 前端发起请求 (CartClient.tsx)

```typescript
// src/components/CartClient.tsx

const handleCheckout = async () => {
  // 步骤 1: 转换数据格式
  const lineItems = items.map(item => ({
    id: item.productId,      // 从 productId 提取
    quantity: item.quantity  // 数量
  }));
  
  // 步骤 2: 发送 POST 请求
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineItems })  // ← 关键：参数名必须是 lineItems
  });
  
  // 步骤 3: 解析响应
  const data = await response.json();
  
  // 步骤 4: 跳转到 Stripe
  if (response.ok && data.url) {
    window.location.href = data.url;  // ← 这里触发浏览器跳转
  }
};
```

---

### 2️⃣ 后端创建 Stripe Session (checkout/route.ts)

```typescript
// src/app/api/checkout/route.ts

export async function POST(request: NextRequest) {
  // 步骤 1: 验证用户
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  
  // 步骤 2: 解析请求参数
  const {lineItems, shippingAddress} = await request.json();
  
  // 步骤 3: 检查环境变量
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!stripeKey || !siteUrl) {
    return NextResponse.json({
      error: '支付服务未配置',
      message: '请参考: docs/Stripe支付配置指南.md'
    }, {status: 500});
  }
  
  // 步骤 4: 从数据库查询商品
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: lineItems.map(li => li.id) } }
  });
  
  // 步骤 5: 构建 Stripe 订单项
  const items = lineItems.map(li => {
    const product = dbProducts.find(p => p.id === li.id);
    return {
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: product.price  // 价格（分）
      },
      quantity: li.quantity
    };
  });
  
  // 步骤 6: 创建 Stripe Checkout Session
  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    payment_method_types: ['card', 'alipay', 'wechat_pay'],  // ← 支持的支付方式
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cancel`,
    customer_email: user.email
  });
  
  // 步骤 7: 在数据库创建订单草稿
  await prisma.order.create({
    data: {
      userId: user.id,
      orderNo: `ORD${Date.now()}${randomString}`,
      status: 'PENDING',
      paymentRef: session.id,  // ← 关联 Stripe Session ID
      // ... 其他字段
    }
  });
  
  // 步骤 8: 返回 Stripe URL
  return NextResponse.json({
    id: session.id,
    url: session.url  // ← 前端用这个 URL 跳转
  });
}
```

---

### 3️⃣ Stripe Session URL 示例

创建成功后，Stripe 返回的 `session.url` 格式：

```
https://checkout.stripe.com/c/pay/cs_test_a1BcD2EfG3HiJ4KlM5NoPqR6StU7VwX8YzA9BcD0EfG1HiJ2KlM3NoP4QrS5TuV6WxY7ZaB8CdE9FgH0IjK1LmN2OpQ3RsT4UvW5XyZ6AbC7DeF8GhI9JkL0MnO1PqR2StU3VwX4YzA5BcD6EfG7HiJ8
```

这个 URL：
- 由 Stripe 动态生成
- 每次结账都不同
- 包含了订单信息和可用支付方式
- 用户在此页面完成支付

---

## 🔐 安全机制

### 1. 用户身份验证

```typescript
// 前端
const me = await fetch('/api/auth/me');
if (!me.ok) {
  window.location.href = `/${locale}/login`;
  return;
}

// 后端
const user = await getAuthUser();
if (!user) return 401;
```

### 2. 价格验证

❌ **错误做法**：前端传递价格
```typescript
// 危险！用户可以修改价格
{ id: 'product1', price: 100, quantity: 1 }
```

✅ **正确做法**：后端从数据库查询价格
```typescript
// 安全：价格从数据库获取，用户无法篡改
const dbProducts = await prisma.product.findMany({
  where: { id: { in: productIds } }
});
const price = dbProduct.price;  // ← 使用数据库中的真实价格
```

### 3. 订单关联

每个订单都关联一个唯一的 Stripe Session ID：

```typescript
await prisma.order.create({
  data: {
    paymentRef: session.id,  // ← Stripe Session ID
    // 后续可以通过这个 ID 查询支付状态
  }
});
```

---

## 📦 数据流转示例

### 输入（前端）

```json
{
  "lineItems": [
    { "id": "cmhadkiab0002iv0452839qmu", "quantity": 3 },
    { "id": "cmhadu0ep0000ji04l8qg7gwy", "quantity": 1 }
  ]
}
```

### 数据库查询结果

```javascript
[
  { id: "cmhadkiab...", name: "测试戒指-01", price: 88800 },  // $888.00
  { id: "cmhadu0ep...", name: "和田玉吊坠", price: 145600 }   // $1456.00
]
```

### Stripe 订单项

```javascript
[
  {
    price_data: {
      currency: 'usd',
      product_data: { name: "测试戒指-01" },
      unit_amount: 88800  // $888.00 = 88800 分
    },
    quantity: 3
  },
  {
    price_data: {
      currency: 'usd',
      product_data: { name: "和田玉吊坠" },
      unit_amount: 145600
    },
    quantity: 1
  }
]
```

### 金额计算

```typescript
subtotalCents = (88800 × 3) + (145600 × 1) = 412000 分 = $4120.00
shippingCents = 412000 >= 10000 ? 0 : 444  // 满$100免运费 → 0
totalCents = 412000 + 0 = 412000 分 = $4120.00
```

### 返回结果（后端 → 前端）

```json
{
  "id": "cs_test_a1BcD2EfG3HiJ4KlM5NoPqR...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1BcD..."
}
```

### 浏览器跳转

```javascript
window.location.href = "https://checkout.stripe.com/c/pay/cs_test_a1BcD...";
// 浏览器自动跳转到 Stripe Checkout 页面
```

---

## 🧪 测试流程

### 1. 本地测试（需先配置 Stripe）

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问购物车
http://localhost:3000/zh/cart

# 3. 点击"去结账"
# ↓ 应该跳转到 Stripe Checkout 页面

# 4. 使用测试卡号支付
卡号: 4242 4242 4242 4242
日期: 12/34（任意未来日期）
CVV: 123（任意3位数字）

# 5. 支付成功后
# ↓ 跳转到 http://localhost:3000/success
```

### 2. 查看 Stripe Dashboard

1. 登录 https://dashboard.stripe.com/test/payments
2. 查看所有测试支付记录
3. 点击具体支付查看详情（金额、状态、商品等）

---

## 🚨 常见问题

### Q1: 点击"去结账"后没有跳转？

**排查步骤：**

1. 打开浏览器控制台（F12）
2. 查看 Network 标签
3. 找到 `/api/checkout` 请求
4. 检查响应：
   - 200 + `{url: "..."}` → 正常，检查是否有 JavaScript 错误
   - 500 → 查看错误信息，可能是环境变量未配置
   - 401 → 用户未登录

### Q2: 报错 "Missing STRIPE_SECRET_KEY"？

**解决方案：**

参考 `docs/Stripe支付配置指南.md` 配置环境变量。

### Q3: Stripe 页面只显示信用卡，没有支付宝？

**原因：**

需要在 Stripe Dashboard 启用 Alipay 和 WeChat Pay。

**解决方案：**

1. 登录 Stripe Dashboard
2. Settings → Payment methods
3. 启用 Alipay 和 WeChat Pay

### Q4: 测试支付成功后，数据库订单状态还是 PENDING？

**原因：**

需要配置 Webhook 来接收支付成功的回调。

**解决方案：**

参考 `docs/Stripe支付配置指南.md` 的 Webhook 配置章节。

---

## 📚 相关文档

- [Stripe 支付配置指南](./Stripe支付配置指南.md) - Stripe 注册和配置
- [环境变量配置](./环境变量配置.md) - 环境变量说明
- [订单流程设计](./订单流程设计.md) - 完整的订单系统设计

---

**现在您完全了解了 Stripe Checkout 的跳转流程！** 🎉

