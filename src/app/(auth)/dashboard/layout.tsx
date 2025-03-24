import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import Footer from '@/components/footer';
import Header from '@/components/ui/header-dashboard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className='max-w-7xl mx-auto px-side min-h-screen'>
      {/* <Header /> */}
      <DashboardShell>{children}</DashboardShell>
      <Footer />
    </main>
  );
}
