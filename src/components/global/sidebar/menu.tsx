'use client';

import { IChannels } from '@/components/global/sidebar';
import { SIDEBAR_SETTINGS_MENU } from '@/constants/menus';
import { useChannelInfo } from '@/hooks/channels';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefObject } from 'react';
import IconRenderer from '../icon-renderer';
import IconDropDown from './icon-dropdown';

type Props = {
  channels: IChannels[];
  optimisticChannel:
    | {
        id: string;
        name: string;
        icon: string;
        createdAt: Date;
        groupId: string | null;
      }
    | undefined;
  loading: boolean;
  groupId: string;
  groupUserId: string;
  userId: string;
};

const SidebarMenu = ({
  channels,
  optimisticChannel,
  loading,
  groupId,
  groupUserId,
  userId,
}: Props) => {
  const pathname = usePathname();
  const currentPage = pathname.split('/').pop();

  const {
    channel: current,
    onEditChannel,
    channelRef,
    inputRef,
    variables,
    isPending,
    edit,
    triggerRef,
    onSetIcon,
    icon,
    onChannelDelete,
    deleteVariables,
  } = useChannelInfo();

  if (pathname.includes('settings')) {
    return (
      <div className='flex flex-col'>
        {SIDEBAR_SETTINGS_MENU.map((item) =>
          item.integration ? (
            userId === groupUserId && (
              <Link
                className={cn(
                  'flex gap-x-2 items-center font-semibold rounded-xl text-themeTextGray hover:bg-themeGray p-2',
                  currentPage === 'settings'
                    ? !item.path && 'text-white'
                    : currentPage === item.path && 'text-white'
                )}
                href={`/group/${groupId}/settings/${item.path}`}
                key={item.id}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          ) : (
            <Link
              className={cn(
                'flex gap-x-2 items-center font-semibold rounded-xl text-themeTextGray hover:bg-themeGray p-2',
                currentPage === 'settings'
                  ? !item.path && 'text-white'
                  : currentPage === item.path && 'text-white'
              )}
              href={`/group/${groupId}/settings/${item.path}`}
              key={item.id}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {channels && channels.length > 0 && (
        <>
          {channels.map(
            (channel) =>
              channel.id !== deleteVariables?.id && (
                <Link
                  id='channel-link'
                  key={channel.id}
                  className={cn(
                    'flex justify-between hover:bg-themeGray p-2 group rounded-lg items-center',
                    channel.id === current && edit && 'bg-themeGray'
                  )}
                  href={`/group/${channel.groupId}/channel/${channel.id}`}
                  {...(channel.name !== 'general' &&
                    channel.name !== 'announcements' && {
                      onDoubleClick: () => onEditChannel(channel.id),
                      ref: channelRef,
                    })}
                >
                  <div className='flex gap-x-2 items-center'>
                    {channel.id === current && edit ? (
                      <IconDropDown
                        ref={triggerRef as RefObject<HTMLButtonElement>}
                        page={currentPage}
                        onSetIcon={onSetIcon}
                        channelId={channel.id}
                        icon={channel.icon}
                        currentIcon={icon}
                      />
                    ) : (
                      <IconRenderer
                        icon={channel.icon}
                        mode={currentPage === channel.id ? 'LIGHT' : 'DARK'}
                      />
                    )}
                  </div>
                </Link>
              )
          )}
        </>
      )}
    </div>
  );
};

export default SidebarMenu;
