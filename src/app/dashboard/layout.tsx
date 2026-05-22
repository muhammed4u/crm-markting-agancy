import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { DashboardShell } from '@/components/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await AuthService.getSession();

  // Route security fallback (middleware already handles this, but server side redirect adds defense-in-depth)
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}
