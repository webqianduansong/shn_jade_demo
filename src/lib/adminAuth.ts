import { cookies } from 'next/headers';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.value) as AdminUser;
    if (parsed && parsed.email && parsed.role === 'admin') return parsed;
  } catch {}
  return null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new Error('ADMIN_UNAUTHORIZED');
  return admin;
}

export function isEmailAdmin(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}


