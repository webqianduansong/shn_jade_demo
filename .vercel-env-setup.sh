#!/bin/bash
# Vercel 环境变量配置脚本

echo "开始配置 Vercel 环境变量..."

# 检查是否已登录 Vercel
if ! vercel whoami >/dev/null 2>&1; then
    echo "请先登录 Vercel: vercel login"
    exit 1
fi

# 配置环境变量
vercel env add DATABASE_URL production << ENVEOF
postgresql://postgres.zvccpydkutdcvgxiawix:S5tk/g67UVfbGGa@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
ENVEOF

vercel env add R2_ENDPOINT production << ENVEOF
https://610c5ef2ea1a3e844a456324bde9a990.r2.cloudflarestorage.com
ENVEOF

vercel env add R2_BUCKET_NAME production << ENVEOF
jade-gems-uploads
ENVEOF

vercel env add R2_ACCESS_KEY_ID production << ENVEOF
f94c0a9bd8c40afabddaa381003a03e4
ENVEOF

vercel env add R2_SECRET_ACCESS_KEY production << ENVEOF
bc5e90e35ce1d7cde91107673168b7a13d867b698d1c8c2f37ef07d0282d119b
ENVEOF

vercel env add R2_PUBLIC_URL production << ENVEOF
https://pub-c5bdfef277604dd89acdc9920a889c4d.r2.dev
ENVEOF

vercel env add ADMIN_EMAIL production << ENVEOF
admin@example.com
ENVEOF

vercel env add ADMIN_PASSWORD production << ENVEOF
admin123
ENVEOF

echo "✅ 环境变量配置完成！"
echo "现在运行: vercel --prod 重新部署"
