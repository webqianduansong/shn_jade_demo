import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({ success: true, user: admin });
}


