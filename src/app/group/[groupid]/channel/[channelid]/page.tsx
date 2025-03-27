import { onAuthenticatedUser } from '@/actions/auth';
import { onGetChannelInfo } from '@/actions/channels';
import { onGetGroupInfo } from '@/actions/groups';
import { currentUser } from '@clerk/nextjs/server';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

type Props = {
  params: Promise<{ groupid: string; channelid: string }>;
};

// WIP: complete group channel page

const GroupChannelPage = async ({ params }: Props) => {
  const { groupid, channelid } = await params;

  const client = new QueryClient();
  const user = await currentUser();
  const authUser = await onAuthenticatedUser();

  await client.prefetchQuery({
    queryKey: ['channel-info'],
    queryFn: () => onGetChannelInfo(channelid),
  });

  await client.prefetchQuery({
    queryKey: ['about-group-info'],
    queryFn: () => onGetGroupInfo(groupid),
  });

  return (
    <HydrationBoundary state={dehydrate(client)}>
      GroupChannelPage
    </HydrationBoundary>
  );
};

export default GroupChannelPage;
