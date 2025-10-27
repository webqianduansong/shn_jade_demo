import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getAuthUser();
  
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/profile`);
  }

  return <ProfileClient locale={locale} user={user} />;
}

