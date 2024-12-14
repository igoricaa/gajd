import { buttonVariants } from '@/components/ui/button';
import LinkButton from '@/components/ui/link';
import { cn } from '@/lib/utils';
import brat from '@/../public/reviews/brat.jpeg';
import burazerce from '@/../public/reviews/burazerce.jpeg';
import crnjoza from '@/../public/reviews/crnjoza.jpeg';
import marko from '@/../public/reviews/marko.jpeg';
import mirza from '@/../public/reviews/mirza.jpeg';
import Image from 'next/image';
import StarIcon from '@/components/ui/icons/star';
import heroImage from '@/../public/development-repo-hero.png';

const reviews = [
  {
    name: 'Brat',
    image: brat,
  },
  {
    name: 'Burazerce',
    image: burazerce,
  },
  {
    name: 'Crnjoza',
    image: crnjoza,
  },
  {
    name: 'Marko',
    image: marko,
  },
  {
    name: 'Mirza',
    image: mirza,
  },
];

export default function Home() {
  return (
    <main className='pt-20'>
      <Hero />
    </main>
  );
}

const Hero = () => {
  return (
    <section className='max-w-7xl mx-auto px-side flex flex-col lg:flex-row items-center justify-center lg:items-start gap-10'>
      <div>
        <h1>
          <span>Knowledge you need,</span>
          <br />
          <span>in one place.</span>
        </h1>
        <p className='text-lg mt-8'>
          Gajd is a platform that helps you find all the resources you need to
          learn,
          <br />
          grow and build, whatever you want.
        </p>
        <div className='mt-8'>
          <LinkButton
            href='/sign-up'
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' })
            )}
          >
            Join the waitlist
          </LinkButton>
          <p className='mt-2'>
            <span>$30% off</span> for the first 100 members (74 left)
          </p>
        </div>
        <div className='flex gap-6 items-center mt-8'>
          <div className='flex'>
            {reviews.map((review) => (
              <div
                key={review.name}
                className='w-12 h-12 -mx-2 overflow-hidden border-4 border-background rounded-full'
              >
                <Image
                  src={review.image}
                  alt={review.name}
                  width={400}
                  height={400}
                  className='object-cover'
                />
              </div>
            ))}
          </div>
          <div className='flex flex-col'>
            <div className='flex'>
              {Array.from({ length: 5 }).map((_, index) => (
                <StarIcon key={index} />
              ))}
            </div>
            <p>
              <span>586</span> members and counting!
            </p>
          </div>
        </div>
      </div>
      <div className=''>
        <Image
          src={heroImage}
          alt='Frontend + Backend + Creative Development + Animations + CMS + Ecommerce Resources '
          width={1080}
          height={1080}
          priority
          className='object-cover max-w-xl w-full ml-auto'
        />
      </div>
    </section>
  );
};

{
  /* <div className='flex gap-4 items-center flex-col sm:flex-row pt-20'>
      <a
        className='rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5'
        href='/sign-up'
        rel='noopener noreferrer'
      >
        Sign Up
      </a>
      <a
        className='rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44'
        href='/sign-in'
        rel='noopener noreferrer'
      >
        Sign In
      </a>
      <a
        className='rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5'
        href='/dashboard'
        rel='noopener noreferrer'
      >
        Dashboard
      </a>
    </div> */
}
