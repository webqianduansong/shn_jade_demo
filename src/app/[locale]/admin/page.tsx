import { getAdminUser } from '@/lib/adminAuth';

export default async function AdminDashboardPage() {
  const admin = await getAdminUser();
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {admin ? (
        <p className="text-gray-700">Welcome, {admin.email}</p>
      ) : (
        <p className="text-gray-700">Unauthorized</p>
      )}
    </div>
  );
}


