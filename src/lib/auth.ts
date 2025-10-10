import { cookies } from 'next/headers';

export interface AuthUser {
  email: string;
  name?: string;
}

export const AUTH_COOKIE_NAME = 'auth_user';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const raw = jar.get(AUTH_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.value) as AuthUser;
    if (parsed && typeof parsed.email === 'string' && parsed.email.length > 0) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}


