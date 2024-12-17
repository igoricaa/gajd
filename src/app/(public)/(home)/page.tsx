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
import { CloudRainIcon } from 'lucide-react';
import FeaturesInfo from '@/components/features-info';
import { faq, FaqItem, pricing, PricingItem } from '@/data/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
    <main>
      <Hero />
      <FeaturedOn />
      <Issues />
      <Features />
      <Story />
      <Pricing />
      <FAQ />
      <Testimonials />
      <CtaSection />
    </main>
  );
}

const Hero = () => {
  return (
    <section className='max-w-7xl mx-auto px-side py-20 flex flex-col lg:flex-row items-center justify-between lg:items-start gap-10'>
      <div>
        <span className='bg-foreground text-background text-lg p-2'>
          Served
        </span>
        <h1 className='mt-3'>
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
      <div>
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

const featuredOnItems = [
  {
    title: 'Hacker News',
    link: 'https://news.ycombinator.com/item?id=37333976',
    logo: '/featured-on/hacker-news.png',
  },
  {
    title: 'Product Hunt',
    link: 'https://www.producthunt.com/posts/gajd-knowledge-base',
    logo: '/featured-on/product-hunt.png',
  },
  {
    title: 'Reddit',
    link: 'https://www.reddit.com/r/gajd/new/',
    logo: '/featured-on/reddit.png',
  },
  {
    title: 'Twitter',
    link: 'https://x.com/gajd_io',
    logo: '/featured-on/twitter.png',
  },
];

const FeaturedOn = () => {
  return (
    <section className='max-w-7xl mx-auto flex gap-10 items-center justify-center flex-col sm:flex-row py-14'>
      {featuredOnItems.map((item) => (
        <a
          key={item.title}
          className='text-foreground hover:text-foreground/60 text-lg uppercase font-medium'
          href={item.link}
          rel='noopener noreferrer'
        >
          {item.title}
        </a>
      ))}
    </section>
  );
};

const Issues = () => {
  return (
    <section className='max-w-2xl mx-auto  flex flex-col gap-2 items-center justify-center px-10 py-14 bg-red-400 w-fit mt-20 text-lg'>
      <p>- don't know where to find the resources</p>
      <p>- finding them takes a lot of time, can be days, months, years</p>
      <p>
        - don't even know what is out there, what actually exists and is
        possible
      </p>
      <p>- don't know what to learn</p>
      <p>
        - could end up wasting a lot of money on courses/resources that are not
        worth it
      </p>

      <p className='mt-4 text-2xl flex gap-2 items-center'>
        = you are wasting valuable time and money while not getting the results
        you could <CloudRainIcon className='w-10 h-10' />
      </p>
    </section>
  );
};

const Features = () => {
  return (
    <section className='mt-20 py-20'>
      <div className='max-w-3xl mx-auto '>
        <p className='text-sm text-lime-600 font-medium uppercase'>Solution</p>
        <h2 className='lg:text-5xl mt-3'>
          Find the resources you need,
          <br />
          in one place, now.
        </h2>
        <p className='text-lg mt-8'>
          Verified courses, tutorials, books, blogs, codepens, Youtube channels,
          podcasts, people to follow, learning maps, tips and tricks...
          Resources that have been gathered, verified and curated by experts
          over the years. Gajd has it all.
        </p>
      </div>
      <FeaturesInfo />
    </section>
  );
};

const Story = () => {
  return (
    <section className='py-20'>
      <div className='max-w-2xl mx-auto flex flex-col gap-4'>
        <p className='text-sm text-lime-600 font-medium uppercase'>Story</p>
        <p>Hey, it's Marc 👋</p>
        <p>
          In 2018, I believed I was Mark Zuckerberg, built a startup for 1 year,
          and got 0 users...
        </p>
        <p>
          A few years after my burnout, I restarted the journey differently: I
          shipped like a madman—16 startups in 2 years. Now I'm happy and earn
          $45,000 a month.
        </p>
        <p>
          I realized I was doing the same thing over and over: set up DNS
          records, listen to Stripe webhooks, design pricing section... So I
          built ShipFast for 3 reasons:
        </p>
        <p>Save time and focus on what matters: building a business</p>
        <p>
          Avoid headaches like emails ending in spam or handling Stripe
          subscriptions
        </p>
        <p>
          Get profitable fast—the more you ship, the more you learn, the more
          you earn
        </p>
        <p>
          135,000+ people trust me on Twitter, Product Hunt awarded me Maker of
          the Year 2023, and 5710 indie makers are using ShipFast to launch
          startups quickly, scroll to see what they say.
        </p>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section id='pricing' className='mt-20 pt-24 pb-32 bg-black'>
      <div className='max-w-7xl mx-auto flex flex-col items-center'>
        <p>Pricing</p>
        <h2 className='text-5xl text-center mt-4'>
          Find the resources you need,
          <br />
          in one place, now.
        </h2>
        <p className='mt-2'>
          <span>$30% off</span> for the first 100 members (74 left)
        </p>

        <div className='flex flex-col lg:flex-row gap-4 w-full items-stretch justify-center mt-20'>
          {pricing.map((item: PricingItem, index: number) => (
            <div
              key={item.name}
              className={cn(
                'flex flex-col w-full rounded-xl px-8 py-12 min-h-[500px]',
                index === 1 ? 'bg-background/70' : 'bg-background'
              )}
            >
              <p className='text-xl font-medium'>{item.name}</p>
              <p className='flex gap-3 items-center mt-6 mb-6'>
                <span className='text-lg text-gray-500 line-through'>
                  ${item.price}
                </span>
                <span className='text-3xl font-bold'>${item.salePrice}</span>
              </p>
              {item.features.map((feature: string, index: number) => (
                <p key={feature + index} className='mt-2'>
                  {feature}
                </p>
              ))}

              <LinkButton
                href={item.buyLink}
                className={cn(
                  'mt-auto',
                  buttonVariants({ variant: 'default', size: 'default' })
                )}
              >
                Buy
              </LinkButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  return (
    <section className='max-w-7xl mx-auto mt-20 py-20 flex justify-between w-full'>
      <div className='basis-1/2'>
        <h2 className='text-4xl whitespace-nowrap'>
          Frequently asked questions
        </h2>
      </div>

      <Accordion type='single' collapsible className='basis-1/2'>
        {faq.map((item: FaqItem, index: number) => (
          <AccordionItem
            key={item.question + index}
            value={`item-${index + 1}`}
          >
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className='mt-20 py-20 max-w-7xl mx-auto flex flex-col items-center justify-center'>
      <h2 className='text-5xl'>5718 makers built AI tools, SaaS, and more</h2>
      <p>They made their first $ online, and some even quit their 9-5!</p>

      <div className='flex gap-20 mt-20 justify-between'>
        <div className='flex flex-col'>
          <p>
            I was able to launch my project in just one day! I made 170$
            already.
          </p>

          <div className='flex gap-4 items-center'>
            <div className='w-12 h-12 -mx-2 overflow-hidden border-4 border-background rounded-full'>
              <Image
                src={mirza}
                alt='Mateus De Nardo'
                width={48}
                height={48}
                className='object-cover'
              />
            </div>
            <p>Mateus De Nardo</p>
            <p>Built a SaaS</p>
          </div>
        </div>
        <div className='flex flex-col'>
          <p>
            I was able to launch my project in just one day! I made 170$
            already.
          </p>

          <div className='flex gap-4 items-center'>
            <div className='w-12 h-12 -mx-2 overflow-hidden border-4 border-background rounded-full'>
              <Image
                src={mirza}
                alt='Mateus De Nardo'
                width={48}
                height={48}
                className='object-cover'
              />
            </div>
            <p>Mateus De Nardo</p>
            <p>Built a SaaS</p>
          </div>
        </div>
        <div className='flex flex-col'>
          <p>
            I was able to launch my project in just one day! I made 170$
            already.
          </p>

          <div className='flex gap-4 items-center'>
            <div className='w-12 h-12 -mx-2 overflow-hidden border-4 border-background rounded-full'>
              <Image
                src={mirza}
                alt='Mateus De Nardo'
                width={48}
                height={48}
                className='object-cover'
              />
            </div>
            <p>Mateus De Nardo</p>
            <p>Built a SaaS</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => {
  return (
    <section className='mt-20 py-20 max-w-3xl mx-auto text-center'>
      <h2 className='text-5xl'>Boost your app, launch, earn</h2>
      <p className='text-lg'>
        Don't waste time on Stripe subscriptions or designing a pricing
        section...
      </p>
      <LinkButton
        href='/sign-up'
        className={cn(
          buttonVariants({ variant: 'default', size: 'default' }),
          'mt-12'
        )}
      >
        Join the waitlist
      </LinkButton>
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
