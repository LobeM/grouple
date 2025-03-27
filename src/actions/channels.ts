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
