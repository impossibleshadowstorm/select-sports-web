import * as z from 'zod';

export const profileSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Full Name must be at least 3 characters' }),
  phone: z.string().min(10, { message: 'Phone Number must be valid' }),
  dob: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Date of Birth should be in YYYY-MM-DD format'
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Gender must be MALE, FEMALE, or OTHER'
  }),
  email: z.string().email({ message: 'Enter a valid email' }),
  address: z.object({
    street: z.string().min(3, { message: 'Street name is required' }),
    city: z.string().min(2, { message: 'City name is required' }),
    state: z.string().min(2, { message: 'State is required' }),
    postalCode: z.string().min(5, { message: 'Postal Code must be valid' }),
    country: z.string().default('INDIA')
  })
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
