import { BsBarChartFill, BsFillStarFill } from 'react-icons/bs';
import { PiGlobeFill } from 'react-icons/pi';

import { IStats } from '@/types';

export const stats: IStats[] = [
  {
    title: '10K+',
    icon: <BsBarChartFill size={34} className='text-[#17633a]' />,
    description:
      'Slots booked successfully each month, ensuring smooth user experience.'
  },
  {
    title: '4.9',
    icon: <BsFillStarFill size={34} className='text-yellow-500' />,
    description:
      'Average user rating across platforms, reflecting customer satisfaction.'
  },
  {
    title: '20+ ',
    icon: <PiGlobeFill size={34} className='text-green-600' />,
    description: 'Venues available with real-time booking and management.'
  }
];
