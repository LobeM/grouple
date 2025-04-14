import { Empty } from '@/icons';
import { RefreshCcwIcon } from 'lucide-react';
import Link from 'next/link';

export const NoResult = () => {
  return (
    <div className='lg:col-span-3 md:col-span-2 flex flex-col items-center gap-y-16'>
      <Link href='/explore' className='flex gap-3 text-themeTextGray'>
        <RefreshCcwIcon />
        Refresh
      </Link>
      <Empty />
      <div>
        <p className='text-xl font-semibold text-themeTextGray'>
          Hmm... Its quite in here
        </p>
        <p className='text-sm text-themeTextGray'>0 Results Found...</p>
      </div>
    </div>
  );
};
