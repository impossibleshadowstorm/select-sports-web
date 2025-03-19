import { ITestimonial } from '@/types';
import { siteDetails } from './siteDetails';

export const testimonials: ITestimonial[] = [
  {
    name: 'John Smith',
    role: 'Football Player',
    message: `${siteDetails.siteName} makes booking football slots so easy! The real-time availability feature ensures I always find a slot that fits my schedule. Highly recommend it to all football lovers!`,
    avatar: '/images/testimonial-1.webp'
  },
  {
    name: 'Jane Doe',
    role: 'Regular User',
    message: `I love how ${siteDetails.siteName} provides detailed venue descriptions and live slot availability. Finding the perfect time and place to play has never been this easy!`,
    avatar: '/images/testimonial-2.webp'
  },
  {
    name: 'Emily Johnson',
    role: 'Football Enthusiast',
    message: `${siteDetails.siteName} is the ultimate platform for football lovers. The easy booking process and secure payments make the whole experience smooth and hassle-free.`,
    avatar: '/images/testimonial-3.webp'
  }
];
