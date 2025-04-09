'use server';

import { client } from '@/lib/prisma';
import { onAuthenticatedUser } from './auth';

export const onGetChannelInfo = async (channelId: string) => {
  try {
    const user = await onAuthenticatedUser();
    const channel = await client.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        posts: {
          take: 3,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            channel: {
              select: {
                name: true,
              },
            },
            author: {
              select: {
                firstname: true,
                lastname: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
            likes: {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
      },
    });
    if (channel) return { status: 200, channel };
    return { status: 404, message: 'Channel not found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onCreateNewChannel = async (
  groupId: string,
  data: {
    id: string;
    name: string;
    icon: string;
  }
) => {
  try {
    const channel = await client.group.update({
      where: {
        id: groupId,
      },
      data: {
        channel: {
          create: {
            ...data,
          },
        },
      },
      select: {
        channel: true,
      },
    });

    if (channel) return { status: 200, channel: channel.channel };
    return { status: 404, message: 'Channel could not be created' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onUpdateChannelInfo = async (
  channelId: string,
  name?: string,
  icon?: string
) => {
  try {
    if (name) {
      const channel = await client.channel.update({
        where: {
          id: channelId,
        },
        data: {
          name,
        },
      });
      if (channel)
        return {
          status: 200,
          message: 'Channel name successfully updated',
        };
      return { status: 404, message: 'Channel could not be updated' };
    }
    if (icon) {
      const channel = await client.channel.update({
        where: {
          id: channelId,
        },
        data: {
          icon,
        },
      });
      if (channel)
        return {
          status: 200,
          message: 'Channel icon successfully updated',
        };
      return { status: 404, message: 'Channel not found! try again later' };
    } else {
      const channel = await client.channel.update({
        where: {
          id: channelId,
        },
        data: {
          name,
          icon,
        },
      });
      if (channel)
        return {
          status: 200,
          message: 'Channel successfully updated',
        };
      return { status: 404, message: 'Channel not found! try again later' };
    }
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onDeleteChannel = async (channelId: string) => {
  try {
    const channel = await client.channel.delete({
      where: {
        id: channelId,
      },
    });
    if (channel)
      return { status: 200, message: 'Channel deleted successfully' };
    return { status: 404, message: 'Channel not found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};
