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
import { authorizedPost } from '@/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlotStatus, SlotType, Sport, Venue } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { format } from 'date-fns';
// TODO: start, end time and max player would be in one line
// Team 1 and Team 2 will as of different section and each will have Name and Color Selector
// Sports will be listed as a select dropdown menu
// Venues will be listed as a select dropdown menu
// Host must also be selectable [Note: create a host endpoint to get all the host and an endpoint to create a host]

// Validation Schema
const formSchema = z.object({
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
  maxPlayer: z.number().min(1, 'At least one player is required.'),
  slotType: z.nativeEnum(SlotType),
  status: z.nativeEnum(SlotStatus),
  sportId: z.string().min(1, 'Sport is required.'),
  venueId: z.string().min(1, 'Venue is required.'),
  team1Name: z.string().min(5, 'Team1 Name must be od minimum 5 Characters.'),
  team1Color: z.string().min(7, 'Team2 Color is required.'),
  team2Name: z.string().min(5, 'Team2 Name must be od minimum 5 Characters.'),
  team2Color: z.string().min(7, 'Team2 Color is required.'),
  hostId: z.string().optional()
});

export default function SlotForm({
  initialData,
  availableSports,
  availableVenues,
  pageTitle
}: {
  initialData: any;
  availableSports: Sport[];
  availableVenues: Venue[];
  pageTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const defaultValues = {
    startTime: initialData?.startTime ? initialData?.startTime : '',
    endTime: initialData?.endTime ? initialData?.endTime?.toString() : '',
    maxPlayer: initialData?.maxPlayer || 1,
    slotType: SlotType.MATCH,
    status: SlotStatus.AVAILABLE,
    sportId: initialData?.sportId || '',
    venueId: initialData?.venueId || '',
    team1Name: initialData?.team1?.name || '',
    team1Color: initialData?.team1?.color || '',
    team2Name: initialData?.team2?.name || '',
    team2Color: initialData?.team2?.color || '',
    hostId: ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const formattedStartTime = format(
          new Date(values.startTime),
          "yyyy-MM-dd'T'HH:mm:ss"
        );
        const formattedEndTime = format(
          new Date(values.endTime),
          "yyyy-MM-dd'T'HH:mm:ss"
        );
        const formattedValues = {
          ...values,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          team1: { name: values.team1Name, color: values.team1Color },
          team2: { name: values.team2Name, color: values.team2Color }
        };
        const response = await authorizedPost(
          '/admin/slots/',
          session?.user?.id!,
          formattedValues
        );

        if (response.status === 201) {
          toast.success(response.message);
          form.reset();
          router.push('/dashboard/slots');
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-3 gap-4'>
              {/* Start Time */}
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End time */}
              <FormField
                control={form.control}
                name='endTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Player */}
              <FormField
                control={form.control}
                name='maxPlayer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        disabled={loading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {/* Sports */}

              <FormField
                control={form.control}
                name='sportId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={initialData !== null}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Sport' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Venues Selection */}

              <FormField
                control={form.control}
                name='venueId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={initialData !== null}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Venue' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableVenues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Teams Section Headline */}
            <h3 className='mb-4 text-xl font-bold'>Teams Information</h3>

            {/* Teams Container (Two Columns) */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Team 1 Section */}
              <div className='space-y-4 rounded-lg border p-4'>
                <h3 className='text-center text-lg font-semibold'>Team 1</h3>
                <FormField
                  control={form.control}
                  name='team1Name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team 1 Name</FormLabel>
                      <FormControl>
                        <Input type='text' disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='team1Color'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team 1 Color</FormLabel>
                      <FormControl>
                        <Input
                          type='color'
                          disabled={loading}
                          {...field}
                          value={field.value || '#000000'}
                          className='h-10 w-full'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Team 2 Section */}
              <div className='space-y-4 rounded-lg border p-4'>
                <h3 className='text-center text-lg font-semibold'>Team 2</h3>
                <FormField
                  control={form.control}
                  name='team2Name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team 2 Name</FormLabel>
                      <FormControl>
                        <Input type='text' disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='team2Color'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team 2 Color</FormLabel>
                      <FormControl>
                        <Input
                          type='color'
                          disabled={loading}
                          {...field}
                          value={field.value || '#000000'}
                          className='h-10 w-full'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type='submit' disabled={loading}>
              Add Slot
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
