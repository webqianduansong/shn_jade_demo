#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证所有必需的配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始检查部署配置...\n');

let errors = 0;
let warnings = 0;

// 1. 检查 .env.local 文件
console.log('1️⃣ 检查环境变量文件...');
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ 未找到 .env.local 文件');
  errors++;
} else {
  console.log('✅ .env.local 文件存在');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // 检查必需的环境变量
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      const value = envContent.match(new RegExp(`${varName}="?([^"\\n]+)"?`))?.[1];
      if (value && value !== 'your_value_here') {
        console.log(`   ✅ ${varName} 已配置`);
        
        // 检查 Stripe 密钥类型
        if (varName === 'STRIPE_SECRET_KEY') {
          if (value.startsWith('sk_test_')) {
            console.log('   ⚠️  使用测试环境密钥（本地开发正常）');
          } else if (value.startsWith('sk_live_')) {
            console.log('   ⚠️  使用生产环境密钥（注意！）');
            warnings++;
          }
        }
      } else {
        console.log(`   ❌ ${varName} 未设置值`);
        errors++;
      }
    } else {
      console.log(`   ❌ ${varName} 未配置`);
      errors++;
    }
  });
}

// 2. 检查 Prisma Schema
console.log('\n2️⃣ 检查数据库 Schema...');
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.log('❌ 未找到 prisma/schema.prisma 文件');
  errors++;
} else {
  console.log('✅ schema.prisma 文件存在');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  // 检查必需的模型
  const requiredModels = ['Order', 'OrderItem', 'Address', 'User', 'Product'];
  
  requiredModels.forEach(model => {
    if (schemaContent.includes(`model ${model}`)) {
      console.log(`   ✅ ${model} 模型已定义`);
    } else {
      console.log(`   ❌ ${model} 模型未定义`);
      errors++;
    }
  });
}

// 3. 检查 API 端点文件
console.log('\n3️⃣ 检查 API 端点...');
const apiFiles = [
  'src/app/api/checkout/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/orders/by-session/[session_id]/route.ts',
  'src/app/api/cart/clear/route.ts',
  'src/app/api/user/addresses/route.ts',
];

apiFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} 不存在`);
    errors++;
  }
});

// 4. 检查关键组件
console.log('\n4️⃣ 检查关键组件...');
const componentFiles = [
  'src/components/CartClient.tsx',
  'src/app/success/SuccessPageClient.tsx',
  'src/app/[locale]/profile/ProfileClient.tsx',
];

componentFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} 不存在`);
    errors++;
  }
});

// 5. 检查文档
console.log('\n5️⃣ 检查文档...');
const docFiles = [
  'STRIPE_SETUP.md',
  'docs/Stripe支付配置指南.md',
  'docs/部署支付功能到生产环境.md',
];

docFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ⚠️  ${file} 不存在（非致命）`);
    warnings++;
  }
});

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 检查结果：');
if (errors === 0) console.log(`   ✅ 无错误`);
if (errors > 0) console.log(`   ❌ ${errors} 个错误`);
if (warnings > 0) console.log(`   ⚠️  ${warnings} 个警告`);

if (errors === 0 && warnings === 0) {
  console.log('\n🎉 所有检查通过！可以部署到生产环境。');
  console.log('\n📋 下一步：');
  console.log('   1. 执行数据库迁移: npx prisma db push');
  console.log('   2. 推送代码: git push origin main');
  console.log('   3. 配置 Vercel 环境变量');
  console.log('   4. 重新部署 Vercel');
} else if (errors === 0) {
  console.log('\n⚠️  检查通过，但有警告。');
  console.log('   请查看警告信息并确认是否正常。');
} else {
  console.log('\n❌ 检查失败！请修复错误后再部署。');
  process.exit(1);
}

console.log('\n📚 详细部署指南：docs/部署支付功能到生产环境.md');
console.log('='.repeat(50) + '\n');

