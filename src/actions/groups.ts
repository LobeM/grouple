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

export const onGetGroupInfo = async (groupId: string) => {
  try {
    const user = await onAuthenticatedUser();
    const group = await client.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (group)
      return {
        status: 200,
        group,
        groupOwner: user.id === group.userId ? true : false,
      };

    return { status: 404, message: 'Group not found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onGetUserGroups = async (userId: string) => {
  try {
    const groups = await client.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
            channel: {
              where: {
                name: 'general',
              },
              select: {
                id: true,
              },
            },
          },
        },
        membership: {
          select: {
            Group: {
              select: {
                id: true,
                icon: true,
                name: true,
                channel: {
                  where: {
                    name: 'general',
                  },
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (groups && (groups.group.length > 0 || groups.membership.length > 0))
      return {
        status: 200,
        groups: groups.group,
        members: groups.membership,
      };

    return { status: 404, message: 'Groups not found' };
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

export const onGetAllGroupMembers = async (groupId: string) => {
  try {
    const user = await onAuthenticatedUser();
    const members = await client.members.findMany({
      where: {
        groupId,
        NOT: {
          userId: user.id,
        },
      },
      include: {
        User: true,
      },
    });

    if (members && members.length > 0) {
      return { status: 200, members };
    }

    return { status: 404, message: 'Members not found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onSearchGroups = async (
  mode: 'GROUPS' | 'POSTS',
  query: string,
  paginate?: number
) => {
  try {
    if (mode === 'GROUPS') {
      const fetchedGroups = await client.group.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: 6,
        skip: paginate || 0,
      });

      if (fetchedGroups) {
        if (fetchedGroups.length > 0) {
          return {
            status: 200,
            groups: fetchedGroups,
          };
        }

        return { status: 404, message: 'Groups not found' };
      }
    }

    if (mode === 'POSTS') {
      const fetchedPosts = await client.post.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: 6,
        skip: paginate || 0,
      });

      if (fetchedPosts) {
        return { status: 200, posts: fetchedPosts };
      }

      return { status: 404, message: 'Posts not found' };
    }

    return { status: 400, message: 'Invalid search mode' };
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
