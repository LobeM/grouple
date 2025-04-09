'use client';

import { superbaseClient } from '@/lib/utils';
import { onOnline } from '@/redux/slices/online-member-slice';
import { AppDispatch } from '@/redux/store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useGroupChatOnline = (userId: string) => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const channel = superbaseClient.channel('tracking');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state: any = channel.presenceState();
        for (const user in state) {
          dispatch(
            onOnline({
              members: [{ id: state[user][0].member.userid }],
            })
          );
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            member: {
              userid: userId,
            },
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);
};
