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

const resources = [
  {
    title: 'React Hooks Explained',
    description: 'A comprehensive guide to React Hooks',
    link: 'https://example.com/react-hooks',
    category: 'React',
  },
  {
    title: 'CSS Grid Layout',
    description: 'Master CSS Grid with this tutorial',
    link: 'https://example.com/css-grid',
    category: 'CSS',
  },
  {
    title: 'Next.js 13 Features',
    description: 'Explore the new features in Next.js 13',
    link: 'https://example.com/nextjs-13',
    category: 'Next.js',
  },
  // Add more resources here
];

export function ResourceGrid() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {resources.map((resource, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{resource.category}</Badge>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' size='icon'>
              <Heart className='h-4 w-4' />
            </Button>
            <Button asChild>
              <a href={resource.link} target='_blank' rel='noopener noreferrer'>
                View Resource
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
