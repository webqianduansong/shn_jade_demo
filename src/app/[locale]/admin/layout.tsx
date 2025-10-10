import type { ReactNode } from 'react';
import AdminShell from './AdminShell';

export default async function AdminLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AdminShell locale={locale}>{children}</AdminShell>;
}


