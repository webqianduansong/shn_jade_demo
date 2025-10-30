# 🚀 立即部署到生产环境

## ✅ 已完成

- [x] 数据库迁移（Order、OrderItem、Address 等表已创建）
- [x] 代码已准备就绪
- [x] 文档已完善

---

## 🎯 接下来的 3 个步骤

### 步骤 1：配置 Vercel 环境变量（5分钟）

#### A. 访问 Vercel 设置

```
https://vercel.com/你的用户名/shn-jade-demo/settings/environment-variables
```

或者：
1. 登录 https://vercel.com/
2. 选择项目 `shn-jade-demo`
3. 点击 **Settings** 标签
4. 点击左侧 **Environment Variables**

#### B. 添加 Stripe 配置

点击 **Add** 按钮，添加以下环境变量：

**变量 1：Stripe Secret Key**
```
Name:        STRIPE_SECRET_KEY
Value:       sk_test_你的stripe测试密钥
Environment: ✅ Production (勾选)
```

**变量 2：网站 URL**
```
Name:        NEXT_PUBLIC_SITE_URL
Value:       https://linxijade.songhaonan.site
Environment: ✅ Production (勾选)
```

**变量 3：Stripe Publishable Key（可选）**
```
Name:        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value:       pk_test_你的stripe公钥
Environment: ✅ Production (勾选)
```

> 💡 **提示**：先使用测试密钥（`sk_test_`）进行测试，确认无误后再切换到生产密钥（`sk_live_`）

#### C. 检查现有环境变量

确保以下变量已存在：
- ✅ `DATABASE_URL`
- ✅ `DIRECT_URL`
- ✅ `ADMIN_EMAILS`

---

### 步骤 2：推送代码并部署（自动）

代码已在 GitHub 上最新，Vercel 会自动部署。

如需手动触发部署：

#### A. 访问 Deployments
```
https://vercel.com/你的用户名/shn-jade-demo/deployments
```

#### B. 重新部署
1. 点击最新部署旁的 **`...`** 按钮
2. 选择 **Redeploy**
3. 等待部署完成（约 2-3 分钟）

---

### 步骤 3：测试支付功能（5分钟）

#### A. 访问生产网站
```
https://linxijade.songhaonan.site
```

#### B. 完整测试流程

1. **登录账户**
   - 使用已有账户登录
   - 或注册新账户

2. **添加商品到购物车**
   - 浏览商品
   - 点击"加入购物车"

3. **进入购物车**
   - 访问: `/zh/cart`
   - 查看购物车商品

4. **点击去结账**
   - 应该跳转到 Stripe Checkout 页面
   - URL 类似: `https://checkout.stripe.com/c/pay/...`

5. **使用测试卡号支付**
   ```
   卡号：4242 4242 4242 4242
   日期：12/34（任意未来日期）
   CVV：123（任意3位数字）
   ```

6. **验证支付成功**
   - ✅ 跳转到成功页面（`/success`）
   - ✅ 显示订单信息
   - ✅ 自动清空购物车
   - ✅ 5秒后自动跳转

7. **查看订单**
   - 访问个人中心: `/zh/profile`
   - 点击"我的订单"标签
   - ✅ 看到刚创建的订单

---

## 🔍 验证清单

完成部署后，请验证以下功能：

- [ ] 网站可以正常访问
- [ ] 登录功能正常
- [ ] 购物车功能正常
- [ ] 点击"去结账"能跳转到 Stripe
- [ ] Stripe 支付页面显示正常
- [ ] 支付成功后能返回网站
- [ ] 支付成功页面显示订单信息
- [ ] 个人中心能看到订单列表
- [ ] 订单详情显示正确

---

## 📊 查看数据

### Stripe Dashboard（查看支付记录）
```
https://dashboard.stripe.com/test/payments
```

### Prisma Studio（查看数据库）
```bash
# 本地运行
npx dotenv-cli -e .env.local -- npx prisma studio
```

### Supabase Dashboard（数据库管理）
```
https://supabase.com/dashboard
```

---

## 🆘 遇到问题？

### 问题 1：点击"去结账"没反应

**排查步骤：**
1. 打开浏览器控制台（F12）
2. 查看 Network 标签
3. 找到 `/api/checkout` 请求
4. 查看响应内容

**可能原因：**
- Vercel 环境变量未配置
- Stripe 密钥错误
- 网站 URL 配置错误

**解决方案：**
- 检查 Vercel 环境变量
- 重新部署项目

---

### 问题 2：Stripe 页面报错

**错误信息：**
```
Invalid API Key provided
```

**解决方案：**
- 检查 `STRIPE_SECRET_KEY` 是否正确
- 确保使用的是正确的密钥（测试/生产）

---

### 问题 3：支付成功但订单状态是 PENDING

**说明：**
- 这是正常的！
- 订单初始状态为 PENDING（待支付）
- 在 Stripe Dashboard 可以看到支付成功记录

**未来优化：**
- 配置 Webhook 自动更新订单状态为 PAID

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `STRIPE_SETUP.md` | Stripe 快速配置 |
| `docs/部署支付功能到生产环境.md` | 详细部署指南 |
| `docs/Stripe支付配置指南.md` | 完整配置教程 |
| `docs/支付功能完整总结.md` | 功能总结 |

---

## 🎉 完成部署！

完成以上步骤后，您的玉石网站支付功能就上线了！

用户现在可以：
- ✅ 在线购买商品
- ✅ 使用信用卡/支付宝/微信支付
- ✅ 查看订单记录
- ✅ 管理收货地址

---

## 🔄 下一步优化

- [ ] 配置 Stripe Webhook（自动更新订单状态）
- [ ] 切换到生产环境密钥（真实支付）
- [ ] 添加订单通知（邮件/短信）
- [ ] 完善物流追踪功能

---

**祝生意兴隆！** 💎✨

