import {
  FiBarChart2,
  FiBriefcase,
  FiDollarSign,
  FiLock,
  FiPieChart,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUser
} from 'react-icons/fi';

import { IBenefit } from '@/types';

export const benefits: IBenefit[] = [
  {
    title: 'Easy Slot Booking',
    description:
      'Book your football slots effortlessly with just a few clicks. Enjoy a seamless booking experience designed for convenience.',
    bullets: [
      {
        title: 'Real-Time Availability',
        description:
          'Check live availability and book your preferred slots instantly.',
        icon: <FiBarChart2 size={26} />
      },
      {
        title: 'Flexible Scheduling',
        description:
          'Select from a variety of available slots to match your schedule.',
        icon: <FiTarget size={26} />
      },
      {
        title: 'Instant Confirmation',
        description:
          'Receive immediate confirmation for your bookings and cancellations.',
        icon: <FiTrendingUp size={26} />
      }
    ],
    imageSrc: '/images/benefits-mockup-1.png'
  },
  {
    title: 'Venue Details and Descriptions',
    description:
      'Discover detailed venue information, including available slots and facilities.',
    bullets: [
      {
        title: 'Comprehensive Descriptions',
        description:
          'View detailed descriptions of venues, including location and facilities.',
        icon: <FiDollarSign size={26} />
      },
      {
        title: 'Slot Availability Overview',
        description:
          'Check the availability of slots at each venue in real-time.',
        icon: <FiBriefcase size={26} />
      },
      {
        title: 'Location Details',
        description: 'Easily find venue locations with integrated map support.',
        icon: <FiPieChart size={26} />
      }
    ],
    imageSrc: '/images/benefits-mockup-2.png'
  },
  {
    title: 'Enhanced Profile Management',
    description:
      'Manage your profile with ease. Update your profile picture, personal details, and more for a personalized experience.',
    bullets: [
      {
        title: 'Profile Picture Upload',
        description:
          'Upload and update your profile picture effortlessly using AWS S3.',
        icon: <FiLock size={26} />
      },
      {
        title: 'Real-Time Profile Update',
        description:
          'Make changes to your profile and see them reflected instantly.',
        icon: <FiUser size={26} />
      },
      {
        title: 'Easy Edit Options',
        description: 'Edit your details with a user-friendly interface.',
        icon: <FiShield size={26} />
      }
    ],
    imageSrc: '/images/benefits-mockup-3.png'
  }
];
