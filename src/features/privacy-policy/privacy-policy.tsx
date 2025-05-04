// import { buttonVariants } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { Metadata } from 'next';
// import Link from 'next/link';

// export const metadata: Metadata = {
//   title: 'Privacy Policy',
//   description: 'Privacy Policy of Selectsport '
// };

// export default function PrivacyPolicyPage() {
//   return (
//     <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
//       <Link
//         href='/examples/authentication'
//         className={cn(
//           buttonVariants({ variant: 'ghost' }),
//           'absolute right-4 top-4 hidden md:right-8 md:top-8'
//         )}
//       >
//         Login
//       </Link>
//       <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
//         <div className='absolute inset-0 bg-zinc-900' />
//         <div className='relative z-20 flex items-center text-lg font-medium'>
//           <svg
//             xmlns='http://www.w3.org/2000/svg'
//             viewBox='0 0 24 24'
//             fill='none'
//             stroke='currentColor'
//             strokeWidth='2'
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             className='mr-2 h-6 w-6'
//           >
//             <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
//           </svg>
//           Logo
//         </div>
//         <div className='relative z-20 mt-auto'></div>
//       </div>
//       <div className='flex h-full items-center p-4 lg:p-8'>
//         <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
//           <div className='flex flex-col space-y-2 text-center'>
//             <h1 className='text-2xl font-semibold tracking-tight'>
//               Create an account
//             </h1>
//             <p className='text-sm text-muted-foreground'>
//               Enter your email below to create your account
//             </p>
//           </div>
//           {/* <p className="px-8 text-center text-sm text-muted-foreground">
//             By clicking continue, you agree to our{" "}
//             <Link
//               href="/terms"
//               className="underline underline-offset-4 hover:text-primary"
//             >
//               Terms of Service
//             </Link>{" "}
//             and{" "}
//             <Link
//               href="/privacy"
//               className="underline underline-offset-4 hover:text-primary"
//             >
//               Privacy Policy
//             </Link>
//             .
//           </p> */}
//         </div>
//       </div>
//     </div>
//   );
// }

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions of Select Sports'
};

export default function PrivacyPolicyPage() {
  return (
    <div className='relative min-h-screen'>
      {/* Main Content */}
      <div className='flex flex-col space-y-6 p-6 lg:p-12'>
        <div className='mx-auto max-w-3xl'>
          <h1 className='mb-4 text-3xl font-bold'>
            Terms and Conditions - Select Sports
          </h1>

          <div className='space-y-6 text-sm leading-6 text-gray-700 dark:text-gray-300'>
            <section>
              <h2 className='font-semibold'>1. Introduction</h2>
              <p>
                Welcome to Select Sports! By accessing our services, including
                our website, mobile app, and football playgrounds, you agree to
                abide by the following Terms and Conditions. Please read them
                carefully before making a booking or using our facilities.
              </p>
            </section>

            <section>
              <h2 className='font-semibold'>2. General Terms</h2>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>
                  <strong>Eligibility:</strong> Users must be at least 18 years
                  old to book slots. Minors can participate under the
                  supervision of a legal guardian.
                </li>
                <li>
                  <strong>Account Registration:</strong> Users must provide
                  accurate information when registering on our mobile app.
                </li>
                <li>
                  <strong>Fair Play:</strong> Players must adhere to fair play
                  and maintain sportsmanship during matches.
                </li>
                <li>
                  <strong>Right to Refuse Service:</strong> Select Sports
                  reserves the right to refuse access to users violating these
                  terms.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>
                3. Booking & Cancellation Policy
              </h2>
              <p className='mt-2 font-medium'>Booking Process:</p>
              <ul className='list-inside list-disc space-y-1'>
                <li>
                  Users can book football slots via the Select Sports Mobile App
                  or website.
                </li>
                <li>
                  Payment must be made at the time of booking to confirm the
                  slot.
                </li>
              </ul>

              <p className='mt-4 font-medium'>Cancellation & Refund:</p>
              <ul className='list-inside list-disc space-y-1'>
                <li>
                  Cancellations made 24 hours prior to the booking time are
                  eligible for a full refund.
                </li>
                <li>
                  Cancellations made less than 24 hours before the game are
                  non-refundable.
                </li>
              </ul>

              <p className='mt-4 font-medium'>Late Arrivals & No-Shows:</p>
              <ul className='list-inside list-disc space-y-1'>
                <li>
                  Booked slots will be held for 15 minutes from the scheduled
                  time.
                </li>
                <li>
                  If a player or team does not show up within this period, the
                  booking will be canceled without a refund.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>4. Code of Conduct</h2>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>
                  Players must respect fellow participants, staff, and
                  spectators.
                </li>
                <li>
                  Any form of abusive language, violence, or misconduct will
                  result in an immediate ban from Select Sports facilities.
                </li>
                <li>
                  Alcohol, drugs, and smoking are strictly prohibited within the
                  premises.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>5. Facility Usage</h2>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>
                  Players must use the facilities responsibly and adhere to the
                  rules and guidelines set by Select Sports.
                </li>
                <li>
                  Any damage to the property or equipment due to negligence will
                  be charged to the responsible individual/team.
                </li>
                <li>
                  Select Sports is not responsible for lost or stolen
                  belongings.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>6. Safety & Liability</h2>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>
                  Players acknowledge that participating in sports activities
                  involves a risk of injury.
                </li>
                <li>
                  Select Sports is not liable for any injuries, accidents, or
                  health issues arising during gameplay.
                </li>
                <li>
                  It is recommended that players wear proper sports gear and
                  follow safety guidelines.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>7. Privacy Policy</h2>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>
                  Select Sports collects and stores personal data for booking
                  purposes only.
                </li>
                <li>
                  We do not share user data with third parties without consent.
                </li>
                <li>
                  Users can request data deletion at any time by contacting our
                  support team.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>8. Amendments to Terms</h2>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>
                  Select Sports reserves the right to update these Terms and
                  Conditions at any time.
                </li>
                <li>
                  Users will be notified of any major changes through our
                  website or mobile app.
                </li>
              </ul>
            </section>

            <section>
              <h2 className='font-semibold'>9. UPI and Payment Information</h2>
              <p>
                Select Sports uses <strong>Razorpay</strong> as its payment
                gateway to process transactions securely. Razorpay supports
                various payment methods including UPI (Unified Payments
                Interface), credit/debit cards, and wallets.
              </p>
              <p className='mt-2'>
                UPI is an instant real-time payment system developed by the
                National Payments Corporation of India (NPCI), a Reserve Bank of
                India (RBI)-regulated entity. If you use UPI for making payments
                through our platform, your UPI transaction information is
                handled in accordance with Razorpay’s privacy policy and terms.
              </p>
              <p className='mt-2'>
                If you are a user based in India, you may see a Play Store badge
                titled <em>&quot;Offers Payments through UPI&quot;</em>. This
                badge indicates that the UPI implementation has been validated
                by NPCI. The badge appears only if the app has opted in via the
                Data Safety form on the Google Play Console.
              </p>

              <p className='mt-2'>
                For more information about UPI or to verify the accreditation
                process, you can contact NPCI directly.
              </p>
            </section>

            <section>
              <h2 className='font-semibold'>10. Contact Us</h2>
              <p>
                For any questions or concerns regarding these Terms and
                Conditions, please reach out to us at:
              </p>
              <ul className='mt-2 space-y-1'>
                <li>
                  <strong>Email:</strong>{' '}
                  <a
                    href='mailto:support@selectsports.com'
                    className='text-blue-600 underline dark:text-blue-400'
                  >
                    support@selectsports.com
                  </a>
                </li>
                <li>
                  <strong>Phone:</strong> +91 9518896326
                </li>
                <li>
                  <strong>Website:</strong>{' '}
                  <a
                    href='https://selectsports.in'
                    className='text-blue-600 underline dark:text-blue-400'
                  >
                    https://selectsports.in
                  </a>
                </li>
              </ul>
            </section>

            <p className='mt-6 text-sm italic text-muted-foreground'>
              By using Select Sports services, you agree to these Terms and
              Conditions. Happy playing!
              <br />
              <strong>Select Sports - Play, Compete, Repeat!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
