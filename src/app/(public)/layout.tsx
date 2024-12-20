import Footer from '@/components/footer';
import Header from '@/components/public/header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='flex flex-col min-h-screen'>
      <Header />
      {children}
      <Footer />
    </section>
  );
}
