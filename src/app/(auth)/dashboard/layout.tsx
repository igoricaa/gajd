import Footer from '@/components/footer';
import Header from '@/components/ui/header-dashboard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className='flex flex-col min-h-screen'>
      <Header />
      {children}
      <Footer />
    </main>
  );
}
