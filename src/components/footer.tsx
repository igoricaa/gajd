import { DatabaseZap } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='bg-background border-t border-border'>
      <div className='max-w-7xl mx-auto py-24 px-side flex'>
        <div className='w-80 gap-2 flex-shrink-0'>
          <Link href='/' className='flex items-center gap-2'>
            <DatabaseZap />
            <span className='text-2xl font-semibold'>Gajd</span>
          </Link>
          <p className='text-sm mt-4'>
            Gajd is a platform that helps you
            <br />
            find all the resources you need to learn,
            <br />
            grow and build, whatever you want.
          </p>
        </div>
        <div className='flex pl-24 w-full'>
          <div className='w-1/3 px-4'>
            <p className='uppercase font-semibold'>Links</p>
            <ul className='flex flex-col gap-2 text-sm mt-2'>
              <li>
                <Link href='/about'>About</Link>
              </li>
              <li>
                <Link href='/#pricing'>Pricing</Link>
              </li>
              <li>
                <Link href='/#features'>Features</Link>
              </li>
              <li>
                <Link href='#'>Support</Link>
              </li>
            </ul>
          </div>

          <div className='w-1/3 px-4'>
            <p className='uppercase font-semibold'>Legal</p>
            <ul className='flex flex-col gap-2 text-sm mt-2'>
              <li>
                <Link href='/terms'>Terms of Service</Link>
              </li>
              <li>
                <Link href='/privacy'>Privacy Policy</Link>
              </li>
              <li>
                <Link href='/cookies'>Cookies</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
