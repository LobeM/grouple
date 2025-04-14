'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logout, Settings } from '@/icons';
import { superbaseClient } from '@/lib/utils';
import { onOffline } from '@/redux/slices/online-member-slice';
import { AppDispatch } from '@/redux/store';
import { useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import DropDown from '../drop-down';

type Props = {
  image: string;
  groupId?: string;
  userId?: string;
};

const UserAvatar = ({ image, groupId, userId }: Props) => {
  const { signOut } = useClerk();

  const untrackPresence = async () => {
    await superbaseClient.channel('tracking').untrack();
  };

  const dispatch: AppDispatch = useDispatch();

  const onLogout = async () => {
    untrackPresence();
    dispatch(onOffline({ members: [{ id: userId! }] }));
    signOut({ redirectUrl: '/' });
  };

  return (
    <DropDown
      title='Account'
      trigger={
        <Avatar className='cursor-pointer'>
          <AvatarImage src={image} alt='user' />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      }
    >
      <Link href={`/group/${groupId}/settings`} className='flex gap-x-2 px-2'>
        <Settings /> Settings
      </Link>
      <Button
        onClick={onLogout}
        variant='ghost'
        className='flex gap-x-3 px-2 justify-start w-full'
      >
        <Logout />
        Logout
      </Button>
    </DropDown>
  );
};

export default UserAvatar;
