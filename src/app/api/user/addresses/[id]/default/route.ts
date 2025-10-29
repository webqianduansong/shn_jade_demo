import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 设置默认地址
 * PUT /api/user/addresses/[id]/default
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    // 验证地址是否属于当前用户
    const address = await prisma.address.findFirst({
      where: { 
        id,
        userId: session.id
      }
    });
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }
    
    // 先取消所有默认地址
    await prisma.address.updateMany({
      where: { 
        userId: session.id,
        isDefault: true
      },
      data: { isDefault: false }
    });
    
    // 设置当前地址为默认
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });
    
    return NextResponse.json({
      success: true,
      data: { address: updatedAddress },
      message: '已设为默认地址'
    });
  } catch (error) {
    console.error('[Address Default API] Error:', error);
    return NextResponse.json(
      { success: false, error: '设置默认地址失败' },
      { status: 500 }
    );
  }
}

