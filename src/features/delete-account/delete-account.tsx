'use client';

import { Metadata } from 'next';
import { useState } from 'react';

export const metadata: Metadata = {
  title: 'Request to Delete Your Account and Data',
  description:
    'Fill out the form to request deletion of your Select Sports account and associated data.'
};

export default function DeleteAccountPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    const subject = encodeURIComponent(
      'Account Deletion Request - Select Sports'
    );
    const body = encodeURIComponent(
      `Hello,\n\nI would like to request the deletion of my Select Sports account.\n\nFull Name: ${name}\nEmail: ${email}\nReason: ${reason || 'N/A'}\n\nThank you.`
    );
    const mailtoLink = `mailto:w2w.notification@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className='relative min-h-screen'>
      <div className='flex flex-col space-y-6 p-6 lg:p-12'>
        <div className='mx-auto max-w-3xl'>
          <h1 className='mb-4 text-3xl font-bold'>
            Request Account and Data Deletion - Select Sports
          </h1>

          <div className='space-y-6 text-sm leading-6 text-gray-700 dark:text-gray-300'>
            <section className='mt-12 border-t pt-6'>
              <h2 className='mb-4 text-xl font-semibold'>
                Request Account and Data Deletion
              </h2>
              <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                Please fill out the form below. After clicking submit, your
                email app will open with the request pre-filled. Send the email
                to complete the process.
              </p>

              <div className='max-w-md space-y-4'>
                <div>
                  <label htmlFor='name' className='block text-sm font-medium'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className='w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800'
                  />
                </div>

                <div>
                  <label htmlFor='email' className='block text-sm font-medium'>
                    Registered Email Address
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800'
                  />
                </div>

                <div>
                  <label htmlFor='reason' className='block text-sm font-medium'>
                    Reason for Deletion (optional)
                  </label>
                  <textarea
                    id='reason'
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className='w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800'
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className='rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700'
                >
                  Open Mail App to Submit Request
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
