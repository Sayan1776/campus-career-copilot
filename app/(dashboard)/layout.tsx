import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

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

  // Fetch user profile for the sidebar
  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('name, department, target_role, role')
    .eq('id', uid)
    .single();

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar
        userProfile={{
          name: userProfile?.name || 'User',
          role: userProfile?.role || role,
          department: userProfile?.department || undefined,
          targetRole: userProfile?.target_role || undefined,
        }}
      />
      {/* Main content area — offset by sidebar width on desktop */}
      <main className="flex-1 min-h-screen md:ml-[260px] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
