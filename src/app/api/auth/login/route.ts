import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: '缺少邮箱或密码' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
    }
    const jar = await cookies();
    // 合并匿名购物车（如果存在）到当前用户数据库购物车
    try {
      const rawCart = jar.get('cart');
      if (rawCart?.value) {
        const anonItems = JSON.parse(rawCart.value) as { productId: string; quantity: number }[];
        if (Array.isArray(anonItems) && anonItems.length > 0) {
          const cart = await prisma.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
          // 获取现有项，构建映射
          const existing = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
          const qtyByProduct = new Map<string, number>();
          for (const it of existing) qtyByProduct.set(it.productId, it.quantity);
          for (const it of anonItems) {
            if (!it?.productId || !it?.quantity || it.quantity <= 0) continue;
            const prev = qtyByProduct.get(it.productId) || 0;
            qtyByProduct.set(it.productId, prev + it.quantity);
          }
          // 批量写入（先清空再重建，避免并发复杂度；SQLite 场景可接受）
          await prisma.$transaction([
            prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
            prisma.cartItem.createMany({
              data: Array.from(qtyByProduct.entries()).map(([productId, quantity]) => ({
                cartId: cart.id,
                productId,
                quantity,
              })),
            }),
          ]);
          // 清空匿名购物车 Cookie
          jar.set('cart', JSON.stringify([]), { path: '/', maxAge: 0 });
        }
      }
    } catch {
      // 忽略合并失败，不影响登录
    }

    jar.set(
      AUTH_COOKIE_NAME,
      JSON.stringify({ id: user.id, email: user.email, name: user.name }),
      AUTH_COOKIE_OPTIONS
    );
    return NextResponse.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (e) {
    return NextResponse.json({ success: false, message: '登录失败' }, { status: 500 });
  }
}


