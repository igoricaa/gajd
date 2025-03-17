import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Resource } from '@/lib/db/schema';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/lib/types';

export function ResourceGrid({
  resources,
  categoriesAndSubcategories,
}: {
  resources: Resource[];
  categoriesAndSubcategories: Category[];
}) {
  return (
    <div className='w-full grid gap-4 md:grid-cols-2 lg:grid-cols-3 [&:has(*:hover)>*]:opacity-50 [&:has(*:hover)>*:hover]:opacity-100'>
      {resources.map((resource, index) => (
        <Card
          key={index}
          className='bg-black/20 transition-opacity duration-300 h-fit group'
        >
          <Link
            href={`/dashboard/resources/${resource.slug}`}
            className='grid gap-2 p-1.5'
          >
            <div className='relative w-full aspect-video overflow-hidden'>
              {resource.featuredImage && (
                <Image
                  src={resource.featuredImage}
                  alt={resource.name}
                  fill
                  className='object-cover group-hover:scale-110 transition-all duration-300'
                />
              )}
            </div>
            <div className='flex flex-col gap-3 p-1'>
              <div className='grid grid-cols-[1fr_auto] decoration-dotted gap-2 items-center justify-between w-full max-w-full'>
                <h3 className='text-base mb-0 font-semibold leading-5 tracking-tight whitespace-nowrap truncate group-hover:underline underline-offset-4 '>
                  {resource.name}
                </h3>
                <span className='text-xs bg-white text-black flex items-center justify-center p-2.5 py-0.5'>
                  {
                    categoriesAndSubcategories.find(
                      (category) => category.id === resource.categoryId
                    )?.name
                  }
                </span>
              </div>
              <CardDescription className='line-clamp-2'>
                {resource.description}
              </CardDescription>
            </div>
            {/* <CardContent>
            <Badge>{resource.categoryId}</Badge>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' size='icon'>
              <Heart className='h-4 w-4' />
            </Button>
          </CardFooter> */}
          </Link>
        </Card>
      ))}
    </div>
  );
}
