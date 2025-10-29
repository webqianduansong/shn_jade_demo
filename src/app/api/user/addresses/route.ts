import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 获取用户地址列表
 * GET /api/user/addresses
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }
    
    const session = JSON.parse(authCookie.value);
    
    // 获取用户所有地址，默认地址排在前面
    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json({
      success: true,
      data: { list: addresses }
    });
  } catch (error: any) {
    console.error('[Addresses API] Error:', error);
    
    // 如果是数据库表不存在的错误，返回空列表
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.warn('[Addresses API] Address table does not exist yet, returning empty list');
      return NextResponse.json({
        success: true,
        data: { list: [] },
        message: '数据库表尚未创建，请先执行数据库迁移'
      });
    }
    
    return NextResponse.json(
      { success: false, error: '获取地址列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 添加新地址
 * POST /api/user/addresses
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth_user');
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }
    
    const session = JSON.parse(authCookie.value);
    console.log('[Addresses API] Session data:', session);
    console.log('[Addresses API] User ID:', session.id);
    
    // 验证用户是否存在
    const userExists = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true }
    });
    console.log('[Addresses API] User exists:', userExists);
    
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: '用户不存在，请重新登录' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const {
      fullName,
      phone,
      email,
      country,
      state,
      city,
      district,
      addressLine1,
      addressLine2,
      postalCode,
      isDefault = false
    } = body;
    
    // 验证必填字段
    if (!fullName || !phone || !country || !state || !city || !addressLine1 || !postalCode) {
      return NextResponse.json(
        { success: false, error: '请填写完整的地址信息' },
        { status: 400 }
      );
    }
    
    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.id,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }
    
    // 检查地址数量限制（最多10个）
    const addressCount = await prisma.address.count({
      where: { userId: session.id }
    });
    
    if (addressCount >= 10) {
      return NextResponse.json(
        { success: false, error: '最多只能保存10个收货地址' },
        { status: 400 }
      );
    }
    
    // 创建新地址
    const address = await prisma.address.create({
      data: {
        userId: session.id,
        fullName,
        phone,
        email,
        country,
        state,
        city,
        district,
        addressLine1,
        addressLine2,
        postalCode,
        isDefault
      }
    });
    
    return NextResponse.json({
      success: true,
      data: { address },
      message: '地址添加成功'
    });
  } catch (error: any) {
    console.error('[Addresses API] Add address error:', error);
    console.error('[Addresses API] Error code:', error?.code);
    console.error('[Addresses API] Error message:', error?.message);
    console.error('[Addresses API] Error stack:', error?.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '添加地址失败', 
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    );
  }
}

