'use server';

import { CreateGroupSchema } from '@/components/forms/create-group/schema';
import { client } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { onAuthenticatedUser } from './auth';

export const onGetAffiliateInfo = async (id: string) => {
  try {
    const affiliateInfo = await client.affiliate.findUnique({
      where: {
        id,
      },
      select: {
        Group: {
          select: {
            User: {
              select: {
                firstname: true,
                lastname: true,
                image: true,
                id: true,
                stripeId: true,
              },
            },
          },
        },
      },
    });

    if (affiliateInfo) {
      return { status: 200, user: affiliateInfo };
    }

    return { status: 404 };
  } catch (error) {
    return { status: 500 };
  }
};

export const onCreateNewGroup = async (
  userId: string,
  data: z.infer<typeof CreateGroupSchema>
) => {
  try {
    const created = await client.user.update({
      where: {
        id: userId,
      },
      data: {
        group: {
          create: {
            ...data,
            affiliate: {
              create: {},
            },
            member: {
              create: {
                userId: userId,
              },
            },
            channel: {
              create: [
                {
                  id: uuidv4(),
                  name: 'general',
                  icon: 'general',
                },
                {
                  id: uuidv4(),
                  name: 'announcements',
                  icon: 'announcement',
                },
              ],
            },
          },
        },
      },
      select: {
        id: true,
        group: {
          select: {
            id: true,
            channel: {
              select: {
                id: true,
              },
              take: 1,
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (created) {
      return {
        status: 200,
        data: created,
        message: 'Group created successfully',
      };
    }

    return { status: 400, message: 'Failed to create group' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onGetGroupChannels = async (groupId: string) => {
  try {
    const channels = await client.channel.findMany({
      where: {
        groupId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (channels) {
      return { status: 200, channels };
    }

    return { status: 404, message: 'Channels not found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onGetGroupSubscriptions = async (groupId: string) => {
  try {
    const subscriptions = await client.subscription.findMany({
      where: {
        groupId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const count = await client.members.count({
      where: {
        groupId,
      },
    });

    if (subscriptions) {
      return { status: 200, subscriptions, count };
    }

    return { status: 404, message: 'Subscriptions not found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onJoinGroup = async (groupId: string) => {
  try {
    const user = await onAuthenticatedUser();
    const member = await client.group.update({
      where: {
        id: groupId,
      },
      data: {
        member: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    if (member) {
      return { status: 200, message: 'Joined group successfully' };
    }

    return { status: 400, message: 'Failed to join group' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};
