import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasAdminEmails: !!process.env.ADMIN_EMAILS,
    }
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Debug POST endpoint working',
    timestamp: new Date().toISOString(),
  });
}

