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
import {
  createResourceAction,
  editResourceAction,
} from '@/app/(auth)/dashboard/new-resource/actions';
import {
  ResourceCategory,
  ResourceSubcategory,
  Resource,
} from '@/lib/db/schema';
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
  resourceId: z.string().optional(),
});

export function ResourceEditForm({
  categories,
  subcategories,
  resources,
}: {
  categories: ResourceCategory[];
  subcategories: ResourceSubcategory[];
  resources: Resource[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    ResourceSubcategory[]
  >([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

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
      resourceId: '',
    },
  });

  // Filter subcategories when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setFilteredSubcategories([]);
      setSelectedSubcategoryId(null);
      return;
    }

    setFilteredSubcategories(
      subcategories.filter(
        (subcategory) => subcategory.categoryId === parseInt(selectedCategoryId)
      )
    );
  }, [selectedCategoryId, subcategories]);

  // Filter resources when subcategory changes
  useEffect(() => {
    if (!selectedSubcategoryId) {
      setFilteredResources([]);
      return;
    }

    setFilteredResources(
      resources.filter(
        (resource) => resource.subcategoryId === parseInt(selectedSubcategoryId)
      )
    );
  }, [selectedSubcategoryId, resources]);

  // Load resource data when resource is selected
  useEffect(() => {
    const resourceId = form.watch('resourceId');
    if (!resourceId) return;

    const resource = resources.find((r) => r.id === parseInt(resourceId));
    if (!resource) return;

    console.log('Resource data:', {
      useCase: resource.useCase,
      overview: resource.overview,
      howToUse: resource.howToUse,
    });

    // Reset form with resource data
    const formData = {
      name: resource.name,
      slug: resource.slug || '',
      description: resource.description || '',
      featuredImage: resource.featuredImage || '',
      link: resource.link,
      useCase: resource.useCase || null,
      overview: resource.overview || null,
      howToUse: resource.howToUse || null,
      categoryId: resource.categoryId.toString(),
      subcategoryId: resource.subcategoryId?.toString() || '',
      resourceId: resource.id.toString(),
    };

    console.log('Form data being set:', formData);
    form.reset(formData);

    // Set the selected category and subcategory to trigger filtering
    setSelectedCategoryId(resource.categoryId.toString());
    if (resource.subcategoryId) {
      setSelectedSubcategoryId(resource.subcategoryId.toString());
    }
  }, [form.watch('resourceId'), resources]);

  // Add logging for form field values
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'useCase' || name === 'overview' || name === 'howToUse') {
        console.log(`Field ${name} value:`, value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
      } else if (key === 'resourceId' && value) {
        formData.append('id', value.toString());
      } else {
        formData.append(key, value.toString());
      }
    });

    // Use editResourceAction if we have a resourceId, otherwise use createResourceAction
    const result = values.resourceId
      ? await editResourceAction(formData)
      : await createResourceAction(formData);

    setSubmitMessage(result.message || '');
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
                  onValueChange={(value) => {
                    setSelectedSubcategoryId(value);
                    field.onChange(value);
                  }}
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
        {selectedSubcategoryId && (
          <FormField
            control={form.control}
            name='resourceId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name='resourceId'
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a resource' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredResources.map((resource) => (
                      <SelectItem
                        key={resource.id}
                        value={resource.id.toString()}
                      >
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
                      if (res && res[0]) {
                        field.onChange(res[0].url);
                      }
                    }}
                    onUploadError={(error: Error) => {
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
