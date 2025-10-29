import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 获取单个地址详情
 * GET /api/user/addresses/[id]
 */
export async function GET(
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
    
    const address = await prisma.address.findFirst({
      where: { 
        id,
        userId: session.userId
      }
    });
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('[Address API] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取地址失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新地址
 * PUT /api/user/addresses/[id]
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
    const body = await request.json();
    
    // 验证地址是否属于当前用户
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id,
        userId: session.userId
      }
    });
    
    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }
    
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
      isDefault
    } = body;
    
    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.userId,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }
    
    // 更新地址
    const address = await prisma.address.update({
      where: { id },
      data: {
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
      message: '地址更新成功'
    });
  } catch (error) {
    console.error('[Address API] Error:', error);
    return NextResponse.json(
      { success: false, error: '更新地址失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除地址
 * DELETE /api/user/addresses/[id]
 */
export async function DELETE(
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
        userId: session.userId
      }
    });
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: '地址不存在' },
        { status: 404 }
      );
    }
    
    await prisma.address.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: '地址删除成功'
    });
  } catch (error) {
    console.error('[Address API] Error:', error);
    return NextResponse.json(
      { success: false, error: '删除地址失败' },
      { status: 500 }
    );
  }
}

