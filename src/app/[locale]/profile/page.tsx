import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getAuthUser } from '@/lib/auth';
import ProfileClient from './ProfileClient';
import { Spin } from 'antd';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getAuthUser();
  
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/profile`);
  }

  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    }>
      <ProfileClient locale={locale} user={user} />
    </Suspense>
  );
}

