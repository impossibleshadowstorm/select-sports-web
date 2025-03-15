'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  authorizedPatch,
  authorizedPost,
  CommonResponseType
} from '@/lib/api-client';
import { signOut, useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmNewPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword']
  });

export default function ChangePasswordForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const checkCurrentPassword = async (password: string) => {
    try {
      const response = await authorizedPost(
        '/user/verify-password',
        session?.user?.id!,
        { currentPassword: password }
      );
      if (response.status === 200) {
        setIsCurrentPasswordValid(true);
        toast.success('Current password verified');
      } else {
        setIsCurrentPasswordValid(false);
        toast.error(response.message || 'Incorrect password');
      }
    } catch (error) {
      toast.error('Error verifying password');
    }
  };

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    setLoading(true);
    try {
      const response: CommonResponseType = await authorizedPatch(
        '/user/update-password',
        session?.user?.id!,
        {
          newPassword: values.newPassword,
          currentPassword: values.currentPassword
        }
      );

      if (response.status === 200) {
        toast.success('Password updated successfully. Logging out...');
        form.reset();
        setIsCurrentPasswordValid(false);

        setTimeout(() => {
          signOut();
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mt-8 rounded-lg border p-4'>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Current Password Field */}
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter current password'
                      disabled={loading}
                      className='border border-border bg-background text-foreground'
                      {...field}
                      onBlur={() => checkCurrentPassword(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password Field */}
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter new password'
                      disabled={loading || !isCurrentPasswordValid}
                      className='border border-border bg-background text-foreground'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password Field */}
            <FormField
              control={form.control}
              name='confirmNewPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Re-enter new password'
                      disabled={loading || !isCurrentPasswordValid}
                      className='border border-border bg-background text-foreground'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={loading || !isCurrentPasswordValid}>
              Update Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
