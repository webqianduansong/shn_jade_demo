import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// 获取当前管理员信息
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name || admin.email.split('@')[0],
      }
    });
  } catch (error) {
    console.error('Get admin user error:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
