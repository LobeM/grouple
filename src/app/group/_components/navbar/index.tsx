import GlassSheet from '@/components/global/glass-sheet';
import Search from '@/components/global/search';
import Sidebar from '@/components/global/sidebar';
import UserWidget from '@/components/global/user-widget';
import { Button } from '@/components/ui/button';
import { CheckBadge } from '@/icons';
import { currentUser } from '@clerk/nextjs/server';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';

type Props = {
  groupid: string;
  userid: string;
};

const Navbar = async ({ groupid, userid }: Props) => {
  const user = await currentUser();
  return (
    <div className='bg-[#1A1A1D] py-2 px-3 md:px-7 md:py-5 flex gap-5 justify-between md:justify-end items-center'>
      <GlassSheet trigger={<MenuIcon className='md:hidden cursor-pointer' />}>
        <Sidebar groupid={groupid} userid={userid} mobile />
      </GlassSheet>
      <Search
        searchType='POSTS'
        className='rounded-full border-themeGray bg-black !opacity-100 px-3'
        placeholder='Search...'
      />
      <Link href='/group/create' className='hidden md:inline'>
        <Button
          variant='outline'
          className='bg-themeBlack rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray'
        >
          <CheckBadge />
          Create Group
        </Button>
      </Link>
      <UserWidget userId={userid} image={user?.imageUrl!} groupId={groupid} />
    </div>
  );
};

export default Navbar;
