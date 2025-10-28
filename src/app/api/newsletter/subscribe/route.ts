import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // 这里可以集成实际的邮件服务，如：
    // - Mailchimp
    // - SendGrid
    // - AWS SES
    // - 或其他邮件服务提供商
    
    // 模拟保存到数据库
    console.log('Newsletter subscription:', { email, timestamp: new Date().toISOString() });
    
    // 在实际应用中，这里应该：
    // 1. 保存到数据库
    // 2. 发送确认邮件
    // 3. 添加到邮件列表服务
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
