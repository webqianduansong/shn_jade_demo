#!/bin/bash

# 生产环境数据库同步脚本
# 用于将 Banner 表同步到生产数据库

echo "🚀 开始同步生产环境数据库..."

# 检查环境变量
if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_URL" ]; then
  echo "❌ 错误: 请先设置 DATABASE_URL 和 DIRECT_URL 环境变量"
  echo ""
  echo "使用方法:"
  echo "  DATABASE_URL=\"your-database-url\" DIRECT_URL=\"your-direct-url\" ./scripts/sync-production-db.sh"
  exit 1
fi

echo "✅ 环境变量检查通过"

# 生成 Prisma Client
echo "📦 生成 Prisma Client..."
npx prisma generate

# 同步数据库
echo "🔄 同步数据库 schema..."
npx prisma db push --accept-data-loss

echo ""
echo "✅ 数据库同步完成！"
echo ""
echo "📝 下一步："
echo "  1. 登录管理系统"
echo "  2. 进入轮播图管理"
echo "  3. 添加轮播图数据"

