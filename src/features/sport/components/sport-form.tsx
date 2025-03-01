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
import { authorizedPost, authorizedPatch } from '@/lib/api-client';
import { FirstLetterCaps } from '@/lib/utils/string-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { AvailableSports, Sport } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string(),
  rules: z.array(z.string().min(1, 'Rule must not be empty.')).min(1, {
    message: 'You must add at least one rule.'
  }),
  totalPlayer: z
    .number({ invalid_type_error: 'Total players must be a number.' })
    .min(1, {
      message: 'Total players must be at least 1.'
    })
});

export default function SportForm({
  initialData,
  pageTitle
}: {
  initialData: Sport | null;
  pageTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const defaultValues = {
    name: initialData?.name || '',
    rules: initialData?.rules || [''],
    totalPlayer: initialData?.totalPlayer || 1
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  const [rules, setRules] = useState<string[]>(defaultValues.rules);

  const addRule = () => {
    setRules([...rules, '']);
  };

  const updateRule = (index: number, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = value;
    setRules(updatedRules);
    form.setValue('rules', updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_: any, i: number) => i !== index);
    setRules(updatedRules);
    form.setValue('rules', updatedRules);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const response = (await (initialData?.id
          ? authorizedPatch(
              `/admin/sports/${initialData.id}`,
              session?.user?.id!,
              values
            )
          : authorizedPost(`/admin/sports/`, session?.user?.id!, values))) as {
          status: number;
          message: string;
        };

        if (response.status === 201) {
          toast.success(response.message);
          form.reset(defaultValues);
          router.push('/dashboard/sports');
        } else if (response.status === 200) {
          toast.success(response.message);
          form.reset(defaultValues);
          router.push('/dashboard/sports');
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      }
    });
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
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport Name</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value !== '') form.setValue(field.name, value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Sport' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AvailableSports).map((sport, index) => (
                          <SelectItem key={sport + index} value={sport}>
                            {FirstLetterCaps(sport)}
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
                name='totalPlayer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Player</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter Total Player'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='rules'
              render={() => (
                <FormItem>
                  <FormLabel>Rules</FormLabel>
                  <>
                    {rules.map((rule, index) => (
                      <div key={index} className='mb-2 flex items-center gap-4'>
                        <FormControl>
                          <Textarea
                            placeholder={`Rule ${index + 1}`}
                            value={rule}
                            onChange={(e) => updateRule(index, e.target.value)}
                            className='resize-none'
                            disabled={loading}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          onClick={() => removeRule(index)}
                          variant='outline'
                          className='px-3'
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type='button'
                      onClick={addRule}
                      className='mt-2'
                      disabled={loading}
                    >
                      Add Rule
                    </Button>
                  </>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormItem>
              <FormLabel>Rules</FormLabel>
              {rules.map((rule: string, index: number) => (
                <div key={index} className="flex items-center gap-4 mb-2">
                  <FormControl>
                  <Input placeholder={`Rule ${index + 1}`}  />
                    <Textarea
                      placeholder={`Rule ${index + 1}`}
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      className="resize-none"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={() => removeRule(index)}
                    variant="outline"
                    className="px-3"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addRule} className="mt-2">
                Add Rule
              </Button>
              <FormMessage />
            </FormItem> */}
            <Button type='submit' disabled={loading}>
              {initialData?.id ? 'Update Sport' : 'Add Sport'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
