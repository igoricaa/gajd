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

export function ResourceGrid({ resources }: { resources: Resource[] }) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {resources.map((resource, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{resource.name}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{resource.categoryId}</Badge>
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
