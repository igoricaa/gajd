import { buttonVariants } from '@/components/ui/button';
import { RichText } from '@/components/ui/rich-text';
import { getResourceBySlug } from '@/lib/data/resources';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const ResourcePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const slug = (await params).slug;

  const resource = await getResourceBySlug(slug);

  if (!resource) {
    return notFound();
  }

  return (
    <section>
      <div className='flex justify-between gap-4 items-center'>
        <div className='space-y-2'>
          <h2 className='text-2xl mb-0'>{resource.name}</h2>
          <p className='text-sm text-white/80 text-balance'>
            {resource.description}
          </p>
        </div>
        <div className='flex gap-4'>
          <Link href={resource.link} className={cn(buttonVariants())}>
            View Resource
          </Link>
          <Link
            href={`/dashboard`}
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            Go Back
          </Link>
        </div>
      </div>
      {resource.featuredImage && (
        <Link
          href={resource.link}
          className='my-8 block relative w-full aspect-video'
        >
          <Image
            src={resource.featuredImage}
            alt={resource.name}
            fill
            sizes='(max-width: 1280px) 100vw, 1218px'
            className='object-cover'
          />
        </Link>
      )}
      <div className='space-y-8'>
        {resource.useCase && <RichText content={resource.useCase} />}
        {resource.overview && <RichText content={resource.overview} />}
        {resource.howToUse && <RichText content={resource.howToUse} />}
      </div>
    </section>
  );
};

export default ResourcePage;
