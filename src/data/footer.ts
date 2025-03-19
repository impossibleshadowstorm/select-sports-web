import { IMenuItem, ISocials } from '@/types';

export const footerDetails: {
  subheading: string;
  quickLinks: IMenuItem[];
  email: string;
  telephone: string;
  socials: ISocials;
} = {
  subheading:
    'Your go-to platform for booking football slots and managing teams effortlessly.',
  quickLinks: [
    {
      text: 'Features',
      url: '#features'
    },
    // {
    //   text: 'Pricing',
    //   url: '#pricing'
    // },
    {
      text: 'Testimonials',
      url: '#testimonials'
    }
  ],
  email: 'support@selectsports.com',
  telephone: '+1 (123) 456-7890',
  socials: {
    // github: 'https://github.com',
    // x: 'https://twitter.com/x',
    twitter: 'https://twitter.com/Twitter',
    facebook: 'https://facebook.com',
    // youtube: 'https://youtube.com',
    linkedin: 'https://www.linkedin.com',
    // threads: 'https://www.threads.net',
    instagram: 'https://www.instagram.com'
  }
};
