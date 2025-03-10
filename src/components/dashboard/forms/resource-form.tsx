'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createResourceAction } from '@/app/(auth)/dashboard/new-resource/actions';
import { ResourceCategory, ResourceSubcategory } from '@/lib/db/schema';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  link: z.string().url({
    message: 'Please enter a valid URL.',
  }),
  categoryId: z.string({
    required_error: 'Please select a category.',
  }),
  subcategoryId: z.string().optional(),
});

export function ResourceForm({
  categories,
  subcategories,
}: {
  categories: ResourceCategory[];
  subcategories: ResourceSubcategory[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [filteredSubcategories, setFilteredSubcategories] =
    useState<ResourceSubcategory[]>(subcategories);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      link: '',
      categoryId: '',
      subcategoryId: '',
    },
  });

  useEffect(() => {
    if (!selectedCategoryId) return;

    setFilteredSubcategories(
      subcategories.filter(
        (subcategory) => subcategory.categoryId === parseInt(selectedCategoryId)
      )
    );
  }, [selectedCategoryId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createResourceAction(formData);
    setSubmitMessage(result.message);
    setIsSubmitting(false);

    if (result.success) {
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Resource name' {...field} />
              </FormControl>
              <FormDescription>Enter the name of the resource.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Resource description' {...field} />
              </FormControl>
              <FormDescription>
                Provide a brief description of the resource.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='link'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input placeholder='https://example.com' {...field} />
              </FormControl>
              <FormDescription>Enter the URL of the resource.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='categoryId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  setSelectedCategoryId(value);
                  field.onChange(value);
                }}
                defaultValue={field.value}
                name='categoryId'
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category for this resource.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedCategoryId && (
          <FormField
            control={form.control}
            name='subcategoryId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name='subcategoryId'
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a subcategory' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={null as any} key='none'>
                      None
                    </SelectItem>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem
                        key={subcategory.id}
                        value={subcategory.id.toString()}
                      >
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the subcategory for this resource.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        {submitMessage && (
          <p className='mt-4 text-sm text-gray-500'>{submitMessage}</p>
        )}
      </form>
    </Form>
  );
}
