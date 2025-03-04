'use client';

import { Button } from '@/components/ui/button';
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
import { profileSchema } from '../utils/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authorizedPatch } from '@/lib/api-client';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import * as z from 'zod';

// interface ProfileFormType {
//   initialData: any | null;
//   categories: any;
// }
// const ProfileCreateForm: React.FC<ProfileFormType> = ({
//   initialData,
//   categories
// }) => {
//   const params = useParams();
//   const router = useRouter();
//   // eslint-disable-next-line
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // eslint-disable-next-line
//   const [imgLoading, setImgLoading] = useState(false);
//   const title = initialData ? 'Edit Profile' : 'Create Your Profile';
//   const description = initialData
//     ? 'Edit a profile.'
//     : 'To create your resume, we first need some basic information about you.';
//   // eslint-disable-next-line
//   const toastMessage = initialData ? 'Profile updated.' : 'Profile created.';
//   // eslint-disable-next-line
//   const action = initialData ? 'Save changes' : 'Create';
//   const [previousStep, setPreviousStep] = useState(0);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [data, setData] = useState({});
//   // eslint-disable-next-line
//   const delta = currentStep - previousStep;

//   const defaultValues = {
//     jobs: [
//       {
//         jobtitle: '',
//         employer: '',
//         startdate: '',
//         enddate: '',
//         jobcountry: '',
//         jobcity: ''
//       }
//     ]
//   };

//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileSchema),
//     defaultValues,
//     mode: 'onChange'
//   });

//   const {
//     control,
//     formState: { errors }
//   } = form;

//   const { append, remove, fields } = useFieldArray({
//     control,
//     name: 'jobs'
//   });

//   // eslint-disable-next-line
//   const onSubmit = async (data: ProfileFormValues) => {
//     try {
//       setLoading(true);
//       if (initialData) {
//         // await axios.post(`/api/products/edit-product/${initialData._id}`, data);
//       } else {
//         // const res = await axios.post(`/api/products/create-product`, data);
//         // console.log("product", res);
//       }
//       router.refresh();
//       router.push(`/dashboard/products`);
//     } catch (error: any) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   // eslint-disable-next-line
//   const onDelete = async () => {
//     try {
//       setLoading(true);
//       //   await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
//       router.refresh();
//       router.push(`/${params.storeId}/products`);
//     } catch (error: any) {
//     } finally {
//       setLoading(false);
//       setOpen(false);
//     }
//   };

//   const processForm: SubmitHandler<ProfileFormValues> = (data) => {
//     setData(data);
//     // api call and reset
//     // form.reset();
//   };

//   type FieldName = keyof ProfileFormValues;

//   const steps = [
//     {
//       id: 'Step 1',
//       name: 'Personal Information',
//       fields: ['firstname', 'lastname', 'email', 'contactno', 'country', 'city']
//     },
//     {
//       id: 'Step 2',
//       name: 'Professional Informations',
//       // fields are mapping and flattening for the error to be trigger  for the dynamic fields
//       fields: fields
//         ?.map((_, index) => [
//           `jobs.${index}.jobtitle`,
//           `jobs.${index}.employer`,
//           `jobs.${index}.startdate`,
//           `jobs.${index}.enddate`,
//           `jobs.${index}.jobcountry`,
//           `jobs.${index}.jobcity`
//           // Add other field names as needed
//         ])
//         .flat()
//     },
//     { id: 'Step 3', name: 'Complete' }
//   ];

//   const next = async () => {
//     const fields = steps[currentStep].fields;

//     const output = await form.trigger(fields as FieldName[], {
//       shouldFocus: true
//     });

//     if (!output) return;

//     if (currentStep < steps.length - 1) {
//       if (currentStep === steps.length - 2) {
//         await form.handleSubmit(processForm)();
//       }
//       setPreviousStep(currentStep);
//       setCurrentStep((step) => step + 1);
//     }
//   };

//   const prev = () => {
//     if (currentStep > 0) {
//       setPreviousStep(currentStep);
//       setCurrentStep((step) => step - 1);
//     }
//   };

//   const countries = [{ id: 'wow', name: 'india' }];
//   const cities = [{ id: '2', name: 'kerala' }];

//   return (
//     <>
//       <div className='flex items-center justify-between'>
//         <Heading title={title} description={description} />
//         {initialData && (
//           <Button
//             disabled={loading}
//             variant='destructive'
//             size='sm'
//             onClick={() => setOpen(true)}
//           >
//             <Trash className='h-4 w-4' />
//           </Button>
//         )}
//       </div>
//       <Separator />
//       <div>
//         <ul className='flex gap-4'>
//           {steps.map((step, index) => (
//             <li key={step.name} className='md:flex-1'>
//               {currentStep > index ? (
//                 <div className='group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
//                   <span className='text-sm font-medium text-sky-600 transition-colors'>
//                     {step.id}
//                   </span>
//                   <span className='text-sm font-medium'>{step.name}</span>
//                 </div>
//               ) : currentStep === index ? (
//                 <div
//                   className='flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
//                   aria-current='step'
//                 >
//                   <span className='text-sm font-medium text-sky-600'>
//                     {step.id}
//                   </span>
//                   <span className='text-sm font-medium'>{step.name}</span>
//                 </div>
//               ) : (
//                 <div className='group flex h-full w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
//                   <span className='text-sm font-medium text-gray-500 transition-colors'>
//                     {step.id}
//                   </span>
//                   <span className='text-sm font-medium'>{step.name}</span>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//       <Separator />
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(processForm)}
//           className='w-full space-y-8'
//         >
//           <div
//             className={cn(
//               currentStep === 1
//                 ? 'w-full md:inline-block'
//                 : 'gap-8 md:grid md:grid-cols-3'
//             )}
//           >
//             {currentStep === 0 && (
//               <>
//                 <FormField
//                   control={form.control}
//                   name='firstname'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>First Name</FormLabel>
//                       <FormControl>
//                         <Input
//                           disabled={loading}
//                           placeholder='John'
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name='lastname'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Last Name</FormLabel>
//                       <FormControl>
//                         <Input
//                           disabled={loading}
//                           placeholder='Doe'
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name='email'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email</FormLabel>
//                       <FormControl>
//                         <Input
//                           disabled={loading}
//                           placeholder='johndoe@gmail.com'
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name='contactno'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Contact Number</FormLabel>
//                       <FormControl>
//                         <Input
//                           type='number'
//                           placeholder='Enter you contact number'
//                           disabled={loading}
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name='country'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Country</FormLabel>
//                       <Select
//                         disabled={loading}
//                         onValueChange={field.onChange}
//                         value={field.value}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue
//                               defaultValue={field.value}
//                               placeholder='Select a country'
//                             />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {/* @ts-ignore  */}
//                           {countries.map((country) => (
//                             <SelectItem key={country.id} value={country.id}>
//                               {country.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name='city'
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>City</FormLabel>
//                       <Select
//                         disabled={loading}
//                         onValueChange={field.onChange}
//                         value={field.value}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue
//                               defaultValue={field.value}
//                               placeholder='Select a city'
//                             />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {/* @ts-ignore  */}
//                           {cities.map((city) => (
//                             <SelectItem key={city.id} value={city.id}>
//                               {city.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </>
//             )}
//             {currentStep === 1 && (
//               <>
//                 {fields?.map((field, index) => (
//                   <Accordion
//                     type='single'
//                     collapsible
//                     defaultValue='item-1'
//                     key={field.id}
//                   >
//                     <AccordionItem value='item-1'>
//                       <AccordionTrigger
//                         className={cn(
//                           'relative !no-underline [&[data-state=closed]>button]:hidden [&[data-state=open]>.alert]:hidden',
//                           errors?.jobs?.[index] && 'text-red-700'
//                         )}
//                       >
//                         {`Work Experience ${index + 1}`}

//                         <Button
//                           variant='outline'
//                           size='icon'
//                           className='absolute right-8'
//                           onClick={() => remove(index)}
//                         >
//                           <Trash2Icon className='h-4 w-4' />
//                         </Button>
//                         {errors?.jobs?.[index] && (
//                           <span className='alert absolute right-8'>
//                             <AlertTriangleIcon className='h-4 w-4 text-red-700' />
//                           </span>
//                         )}
//                       </AccordionTrigger>
//                       <AccordionContent>
//                         <div
//                           className={cn(
//                             'relative mb-4 gap-8 rounded-md border p-4 md:grid md:grid-cols-3'
//                           )}
//                         >
//                           <FormField
//                             control={form.control}
//                             name={`jobs.${index}.jobtitle`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Job title</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     type='text'
//                                     disabled={loading}
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`jobs.${index}.employer`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Employer</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     type='text'
//                                     disabled={loading}
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`jobs.${index}.startdate`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Start date</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     type='date'
//                                     disabled={loading}
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`jobs.${index}.enddate`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>End date</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     type='date'
//                                     disabled={loading}
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`jobs.${index}.jobcountry`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Job country</FormLabel>
//                                 <Select
//                                   disabled={loading}
//                                   onValueChange={field.onChange}
//                                   value={field.value}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger>
//                                       <SelectValue
//                                         defaultValue={field.value}
//                                         placeholder='Select your job country'
//                                       />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {countries.map((country) => (
//                                       <SelectItem
//                                         key={country.id}
//                                         value={country.id}
//                                       >
//                                         {country.name}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`jobs.${index}.jobcity`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Job city</FormLabel>
//                                 <Select
//                                   disabled={loading}
//                                   onValueChange={field.onChange}
//                                   value={field.value}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger>
//                                       <SelectValue
//                                         defaultValue={field.value}
//                                         placeholder='Select your job city'
//                                       />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {cities.map((city) => (
//                                       <SelectItem key={city.id} value={city.id}>
//                                         {city.name}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       </AccordionContent>
//                     </AccordionItem>
//                   </Accordion>
//                 ))}

//                 <div className='mt-4 flex justify-center'>
//                   <Button
//                     type='button'
//                     className='flex justify-center'
//                     size={'lg'}
//                     onClick={() =>
//                       append({
//                         jobtitle: '',
//                         employer: '',
//                         startdate: '',
//                         enddate: '',
//                         jobcountry: '',
//                         jobcity: ''
//                       })
//                     }
//                   >
//                     Add More
//                   </Button>
//                 </div>
//               </>
//             )}
//             {currentStep === 2 && (
//               <div>
//                 <h1>Completed</h1>
//                 <pre className='whitespace-pre-wrap'>
//                   {JSON.stringify(data)}
//                 </pre>
//               </div>
//             )}
//           </div>

//           {/* <Button disabled={loading} className="ml-auto" type="submit">
//             {action}
//           </Button> */}
//         </form>
//       </Form>
//       {/* Navigation */}
//       <div className='mt-8 pt-5'>
//         <div className='flex justify-between'>
//           <button
//             type='button'
//             onClick={prev}
//             disabled={currentStep === 0}
//             className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
//           >
//             <svg
//               xmlns='http://www.w3.org/2000/svg'
//               fill='none'
//               viewBox='0 0 24 24'
//               strokeWidth='1.5'
//               stroke='currentColor'
//               className='h-6 w-6'
//             >
//               <path
//                 strokeLinecap='round'
//                 strokeLinejoin='round'
//                 d='M15.75 19.5L8.25 12l7.5-7.5'
//               />
//             </svg>
//           </button>
//           <button
//             type='button'
//             onClick={next}
//             disabled={currentStep === steps.length - 1}
//             className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
//           >
//             <svg
//               xmlns='http://www.w3.org/2000/svg'
//               fill='none'
//               viewBox='0 0 24 24'
//               strokeWidth='1.5'
//               stroke='currentColor'
//               className='h-6 w-6'
//             >
//               <path
//                 strokeLinecap='round'
//                 strokeLinejoin='round'
//                 d='M8.25 4.5l7.5 7.5-7.5 7.5'
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProfileCreateForm;

// export default function ProfileCreatePage({
//   initialData
// }: {
//   initialData: any | null;
// }) {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [loading, startTransition] = useTransition();

//   const defaultValues = {
//     name: initialData?.name || '',
//     phone: initialData?.phone || '',
//     dob: initialData?.dob ? initialData.dob.split('T')[0] : '',
//     gender: initialData?.gender || '',
//     email: initialData?.email || '',
//     password: '',
//     address: {
//       street: initialData?.address?.street || '',
//       city: initialData?.address?.city || '',
//       state: initialData?.address?.state || '',
//       postalCode: initialData?.address?.postalCode || ''
//     }
//   };

//   const form = useForm<z.infer<typeof profileSchema>>({
//     resolver: zodResolver(profileSchema),
//     defaultValues
//   });

//   async function onSubmit(values: z.infer<typeof profileSchema>) {
//     console.log('Submitting form:', values);
//     console.log("Submitting values: ");
//     startTransition(async () => {
//       try {
//         const response = await authorizedPatch(
//           `/user/${initialData?.id}`,
//           session?.user?.id!,
//           values
//         );
//         console.log('patching user profile...');
//       } catch (error) {
//         toast.error('An error occurred. Please try again.');
//       }
//     });
//   }

//   return (
//     <Card className='mx-auto w-full'>
//       <CardHeader>
//         <CardTitle className='text-left text-2xl font-bold'>
//           {initialData ? 'Edit Profile' : 'Create Profile'}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
//             <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
//               {/* Name */}
//               <FormField
//                 control={form.control}
//                 name='name'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Full Name</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='text'
//                         placeholder='Enter full name'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Phone */}
//               <FormField
//                 control={form.control}
//                 name='phone'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Phone Number</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='text'
//                         placeholder='Enter phone number'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Email */}
//               <FormField
//                 control={form.control}
//                 name='email'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='email'
//                         placeholder='Enter email'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Password */}
//               <FormField
//                 control={form.control}
//                 name='password'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='password'
//                         placeholder='Enter password'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* DOB & Gender */}
//             <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
//               <FormField
//                 control={form.control}
//                 name='dob'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date of Birth</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='date'
//                         placeholder='YYYY-MM-DD'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name='gender'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Gender</FormLabel>
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder='Select Gender' />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value='MALE'>Male</SelectItem>
//                         <SelectItem value='FEMALE'>Female</SelectItem>
//                         <SelectItem value='OTHER'>Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Address Section */}
//             <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
//               {/* Street */}
//               <FormField
//                 control={form.control}
//                 name='address.street'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Street</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='text'
//                         placeholder='Enter street'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* City */}
//               <FormField
//                 control={form.control}
//                 name='address.city'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>City</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='text'
//                         placeholder='Enter city'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* State */}
//               <FormField
//                 control={form.control}
//                 name='address.state'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>State</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='text'
//                         placeholder='Enter state'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Postal Code */}
//               <FormField
//                 control={form.control}
//                 name='address.postalCode'
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Postal Code</FormLabel>
//                     <FormControl>
//                       <Input
//                         type='text'
//                         placeholder='Enter postal code'
//                         disabled={loading}
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <Button type='submit' disabled={loading}>
//               Update Profile
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }

export default function ProfileCreatePage({
  initialData,
  availableStates
}: {
  initialData: any | null;
  availableStates: string[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const defaultValues = {
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    dob: initialData?.dob ? initialData.dob.split('T')[0] : '',
    gender: initialData?.gender || '',
    email: initialData?.email || '',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      postalCode: initialData?.address?.postalCode || ''
    }
  };

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    startTransition(async () => {
      try {
        const updatedValues = {
          ...values,
          street: values.address.street,
          city: values.address.city,
          state: values.address.state,
          postalCode: values.address.postalCode
        };

        const response: any = await authorizedPatch(
          `/user/${initialData?.id}`,
          session?.user?.id!,
          updatedValues
        );

        if (response.success) {
          toast.success('Profile updated successfully');
          router.push('/dashboard/profile');
        } else {
          toast.error(response.message || 'Failed to update profile');
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
          {initialData ? 'Edit Profile' : 'Create Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Basic Information */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter full name'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter phone number'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DOB & Gender */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='dob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder='YYYY-MM-DD'
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
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Gender' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='MALE'>Male</SelectItem>
                        <SelectItem value='FEMALE'>Female</SelectItem>
                        <SelectItem value='OTHER'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email (Read-only) */}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' disabled readOnly value={field.value} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Address Section */}
            <div className='rounded-lg border p-4'>
              <h2 className='mb-2 text-lg font-semibold'>Address</h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='address.street'
                  render={({ field }) => (
                    <FormItem>
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          placeholder='Enter city'
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name='address.state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          placeholder='Enter state'
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name='address.state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select State' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
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
            </div>

            <Button type='submit' disabled={loading}>
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
