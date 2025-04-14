import { Message } from '@/icons';
import Link from 'next/link';
import Notification from './notification';
import UserAvatar from './user';

type Props = {
  image: string;
  groupId?: string;
  userId?: string;
};

const UserWidget = ({ image, groupId, userId }: Props) => {
  return (
    <div className='gap-5 items-center hidden md:flex'>
      <Notification />
      <Link href={`/group/${groupId}/messages`}>
        <Message />
      </Link>
      <UserAvatar userId={userId} image={image} groupId={groupId} />
    </div>
  );
};

export default UserWidget;
