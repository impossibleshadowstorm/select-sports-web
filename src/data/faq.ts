import { IFAQ } from '@/types';
import { siteDetails } from './siteDetails';

export const faqs: IFAQ[] = [
  {
    question: `Is ${siteDetails.siteName} secure?`,
    answer: `Yes, your data is protected with advanced encryption protocols. We also ensure secure payment processing to keep your financial information safe.`
  },
  {
    question: `Can I book slots for multiple players or teams?`,
    answer: `Absolutely! With ${siteDetails.siteName}, you can book slots for individual players or entire teams in one go.`
  },
  {
    question: `How can I check venue details before booking?`,
    answer: `Each venue listed on ${siteDetails.siteName} includes detailed descriptions, images, and available facilities to help you make informed decisions.`
  },
  {
    question: `Can I cancel my booking if my plans change?`,
    answer: `Yes, you can cancel your booking easily through the app. Refund policies may vary based on the venue’s rules.`
  },
  {
    question: `What if I face issues while booking or making a payment?`,
    answer: `Our support team is available 24/7 via chat or email to assist you. Additionally, you can find helpful guides in our knowledge base for troubleshooting.`
  },
  {
    question: `Are there any discounts for bulk bookings?`,
    answer: `Yes! Some venues offer special discounts for bulk bookings. Check the venue details for available offers or reach out to our support team for more information.`
  }
];
