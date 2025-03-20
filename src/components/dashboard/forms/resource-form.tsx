'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { UploadButton } from '@/components/uploadthing/uploadthing';
import Image from 'next/image';
import { LexicalEditor } from '@/components/ui/lexical-editor';
import { LexicalContent } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  slug: z.string().optional(),
  description: z.string().optional(),
  featuredImage: z.string().optional(),
  link: z.string().url({
    message: 'Please enter a valid URL.',
  }),
  useCase: z.custom<LexicalContent>().optional(),
  overview: z.custom<LexicalContent>().optional(),
  howToUse: z.custom<LexicalContent>().optional(),
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
      slug: '',
      description: '',
      featuredImage: '',
      link: '',
      useCase: undefined,
      overview: undefined,
      howToUse: undefined,
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
      if (value === null || value === undefined) {
        formData.append(key, '');
      } else if (
        key === 'useCase' ||
        key === 'overview' ||
        key === 'howToUse'
      ) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
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
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='useCase'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Use Case</FormLabel>
              <FormControl>
                <LexicalEditor
                  placeholder='Provide a detailed use case for the resource...'
                  onChangeHandler={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='overview'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overview</FormLabel>
              <FormControl>
                <LexicalEditor
                  placeholder='Provide a detailed overview of the resource...'
                  onChangeHandler={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='howToUse'
          render={({ field }) => (
            <FormItem>
              <FormLabel>How to Use</FormLabel>
              <FormControl>
                <LexicalEditor
                  placeholder='Provide a detailed guide on how to use the resource...'
                  onChangeHandler={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='featuredImage'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <div className='space-y-3'>
                <FormControl>
                  <Input placeholder='Resource featured image URL' {...field} />
                </FormControl>

                <div className='flex flex-col gap-2'>
                  <p className='text-sm font-medium'>Or upload an image:</p>
                  <UploadButton
                    endpoint='imageUploader'
                    onClientUploadComplete={(res) => {
                      console.log('Files: ', res);
                      alert('Upload Completed');
                      // Set the URL from the uploaded file to the form field
                      if (res && res[0]) {
                        field.onChange(res[0].url);
                        // toast.success("Image uploaded successfully!");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      // toast.error(`Upload failed: ${error.message}`);
                      alert(`ERROR! ${error.message}`);
                    }}
                  />

                  {field.value && (
                    <div className='mt-2'>
                      <p className='text-sm text-muted-foreground mb-2'>
                        Preview:
                      </p>
                      <Image
                        src={field.value}
                        alt='Featured image preview'
                        className='max-h-40 rounded-md border'
                        width={160}
                        height={160}
                      />
                    </div>
                  )}
                </div>
                <FormMessage />
              </div>
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
