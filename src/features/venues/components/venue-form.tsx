'use client';

import { FileUploader } from '@/components/file-uploader';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { authorizedPost } from '@/lib/api-client';
import { FirstLetterCaps } from '@/lib/utils/string-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { AvailableStates, Sport, VenueAmenities } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// const MAX_FILE_SIZE = 50000000;
// const ACCEPTED_IMAGE_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp",
// ];

// Validation Schema
const formSchema = z.object({
  name: z.string().min(5, 'Venue name must be at least 5 characters.'),
  images: z.array(z.string()).min(3, 'At least 3 Images are required.'),
  description: z
    .string()
    .min(10, 'Description is required and must be at least 10 characters.'),
  state: z.string().min(1, 'State is required.'),
  address: z.object({
    street: z.string().min(1, 'Street is required.'),
    city: z.string().min(1, 'City is required.'),
    postalCode: z
      .string()
      .length(6, 'Postal code must be exactly 6 digits.')
      .regex(/^\d{6}$/, 'Postal code must be numeric.')
  }),
  sports: z.array(z.string()).min(1, 'At least one sport must be selected.'),
  amenities: z
    .array(z.string())
    .min(1, 'At least one amenity must be selected.'),
  locationUrl: z
    .string()
    .url('Invalid URL format. Example: https://maps.google.com')
});

export default function VenueForm({
  initialData,
  availableSports,
  pageTitle
}: {
  availableSports: Sport[] | [];
  initialData: any | null;
  pageTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const defaultValues = {
    name: initialData?.name || '',
    images: initialData?.images || [],
    description: initialData?.description || '',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      // state: initialData?.address?.state || "",
      postalCode: initialData?.address?.postalCode || ''
    },
    state: initialData?.address?.state || '',
    sports: initialData?.sports?.map((sport: Sport) => sport.id) || [],
    amenities: initialData?.amenities || [],
    locationUrl: initialData?.locationUrl || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const body = {
      ...values,
      images: values.images.filter(
        (img: any) => typeof img === 'string' && img.startsWith('https')
      ),
      address: { ...values.address, state: values.state },
      amenities: values.amenities || [],
      locationUrl: values.locationUrl || ''
    };
    startTransition(async () => {
      try {
        const response: any = await authorizedPost(
          '/admin/venues/',
          session?.user?.id!,
          body
        );
        if (response.status === 201) {
          toast.success(response.message);
          form.reset(defaultValues);
          router.push('/dashboard/venues');
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
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={(field.value ?? []).map(
                          (image: string | { url: string }) =>
                            typeof image === 'string' ? { url: image } : image
                        )}
                        maxFiles={4}
                        maxSize={4 * 1024 * 1024}
                        disabled={loading}
                        onUpload={async (uploadedUrls) => {
                          form.setValue('images', [
                            ...(form.getValues('images') ?? []),
                            ...uploadedUrls
                          ]);
                        }}

                        // progresses={progresses}
                        // pass the onUpload function here for direct upload
                        // onUpload={uploadFiles}
                        // disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter Venue Name'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sports'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport Name</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentSports = field.value || [];
                        const updatedSports = [...currentSports, value];
                        form.setValue('sports', updatedSports);
                      }}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Sport' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(availableSports).map((sport, index) => (
                          <SelectItem key={sport.name + index} value={sport.id}>
                            {FirstLetterCaps(sport.name ?? '')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='address.street'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-500'>
                      Venue Address
                    </FormLabel>
                    <br />
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter street'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='address.city'
                render={({ field }) => (
                  <FormItem>
                    <br />
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter City'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* State Name */}
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Name</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value !== '') form.setValue(field.name, value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select State' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AvailableStates).map((state, index) => (
                          <SelectItem key={state + index} value={state}>
                            {FirstLetterCaps(state)}
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
                name='address.postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter postal code'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder='Enter venue description'
                      className='max-h-[200px] min-h-[150px] resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='locationUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps URL</FormLabel>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='Enter location URL'
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='amenities'
              render={() => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className='grid grid-cols-2 gap-2'>
                    {Object.values(VenueAmenities).map((amenity) => (
                      <div key={amenity} className='flex items-center gap-2'>
                        <Checkbox
                          id={amenity}
                          checked={form.watch('amenities')?.includes(amenity)}
                          onCheckedChange={(checked) => {
                            const currentAmenities =
                              form.getValues('amenities') || [];
                            form.setValue(
                              'amenities',
                              checked
                                ? [...currentAmenities, amenity]
                                : currentAmenities.filter((a) => a !== amenity)
                            );
                          }}
                        />
                        <label htmlFor={amenity} className='text-sm'>
                          {FirstLetterCaps(amenity.replace(/_/g, ' '))}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={loading}>
              {initialData?.id ? 'Update Venue' : 'Add Venue'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
