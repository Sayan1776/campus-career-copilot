import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import NotificationListener from '@/app/NotificationListener';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  let uid: string;
  let role: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
    role = (decoded.role as string) || 'student';
  } catch {
    redirect('/login');
  }

  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('name, department, target_role, role')
    .eq('id', uid)
    .single();

  return (
    <div className="flex min-h-screen">
      <NotificationListener />
      <Sidebar
        userProfile={{
          name: userProfile?.name || 'User',
          role: userProfile?.role || role,
          department: userProfile?.department || undefined,
          targetRole: userProfile?.target_role || undefined,
        }}
      />
      <main className="min-h-screen flex-1 overflow-y-auto md:ml-[284px]">
        {children}
      </main>
    </div>
  );
}
