'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { authorizedPost } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TargetType, NotificationType } from '@prisma/client';

// Validation Schema
const formSchema = z.object({
  title: z.string().min(5, 'Notification title must be at least 5 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  type: z.string().min(1, 'Notification type is required.'),
  target: z.string().min(1, 'Target is required.'),
  date: z.string().min(1, 'Date/Time is required.')
});

export default function NotificationForm({
  initialData,
  pageTitle
}: {
  initialData: any | null;
  pageTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const defaultValues = {
    title: initialData?.title || '',
    message: initialData?.message || '',
    type: initialData?.type || '',
    target: initialData?.target || '',
    date: initialData?.date || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // const body = { ...values };
    const { date, ...rest } = values;

    // Convert to ISO string (ensure it's in UTC)
    const expiresAt = new Date(date).toISOString(); // This ensures it gets converted to an ISO string

    const body = { ...rest, expiresAt }; // Include expiresAt in the body
    try {
      const response: any = await authorizedPost(
        '/admin/notifications/',
        session?.user?.id!,
        body
      );
      if (response.status === 201) {
        toast.success(response.message);
        form.reset(defaultValues);
        router.push('/dashboard/notifications');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Enter Notification Title'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter Notification Message'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setValue('type', value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select Notification Type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(NotificationType).map(
                        (notificationType, index) => (
                          <SelectItem
                            key={notificationType + index}
                            value={notificationType}
                          >
                            {notificationType}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='target'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => form.setValue('target', value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select Target' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TargetType).map((targetType, index) => (
                        <SelectItem key={targetType + index} value={targetType}>
                          {targetType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date/Time</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>
              {initialData?.id ? 'Update Notification' : 'Add Notification'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
