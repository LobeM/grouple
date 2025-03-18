'use server';

import { client } from '@/lib/prisma';
import Stripe from 'stripe';
import { onAuthenticatedUser } from './auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
  apiVersion: '2025-02-24.acacia',
});

export const onGetStripeClientSecret = async () => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: 9900,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (paymentIntent) {
      return { secret: paymentIntent.client_secret };
    }
    return { status: 400, message: 'Failed to load form' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onTransferCommission = async (destination: string) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: 3960,
      currency: 'usd',
      destination: destination,
    });
    if (transfer) {
      return { status: 200, message: 'Transfer successful' };
    }
    return { status: 400, message: 'Transfer failed' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onGetActiveSubscription = async (groupId: string) => {
  try {
    const subscription = await client.subscription.findFirst({
      where: {
        groupId: groupId,
        active: true,
      },
    });

    if (subscription) {
      return { status: 200, subscription };
    }
    return { status: 404, message: 'No active subscription found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onGetGroupSubscriptionPaymentIntent = async (groupId: string) => {
  try {
    const price = await client.subscription.findFirst({
      where: {
        groupId: groupId,
        active: true,
      },
      select: {
        price: true,
        Group: {
          select: {
            User: {
              select: {
                stripeId: true,
              },
            },
          },
        },
      },
    });

    if (price && price.price) {
      const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: price.price * 100,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      if (paymentIntent) {
        return { secret: paymentIntent.client_secret };
      }
      return { status: 400, message: 'Failed to load form' };
    }
    return { status: 404, message: 'No active subscription found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onCreateNewGroupSubscription = async (
  groupId: string,
  price: string
) => {
  try {
    const subscription = await client.group.update({
      where: {
        id: groupId,
      },
      data: {
        subscription: {
          create: {
            price: parseInt(price),
          },
        },
      },
    });

    if (subscription) {
      return { status: 200, message: 'Subscription created successfully' };
    }
    return { status: 400, message: 'Failed to create subscription' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onActivateSubscription = async (id: string) => {
  try {
    const status = await client.subscription.findUnique({
      where: {
        id: id,
      },
      select: {
        active: true,
      },
    });
    if (status) {
      if (status.active) {
        return { status: 200, message: 'Plan already active' };
      }
      if (!status.active) {
        const current = await client.subscription.findFirst({
          where: {
            active: true,
          },
          select: {
            id: true,
          },
        });
        if (current && current.id) {
          const deactivate = await client.subscription.update({
            where: {
              id: current.id,
            },
            data: {
              active: false,
            },
          });
          if (deactivate) {
            const activateNew = await client.subscription.update({
              where: {
                id: id,
              },
              data: {
                active: true,
              },
            });
            if (activateNew) {
              return { status: 200, message: 'New plan activated' };
            }
            return { status: 400, message: 'Failed to activate new plan' };
          }
        }
        return { status: 404, message: 'No active plan found' };
      }
    }
    return { status: 404, message: 'No active plan found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};

export const onGetStripeIntegration = async () => {
  try {
    const user = await onAuthenticatedUser();
    const stripeId = await client.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeId: true,
      },
    });
    if (stripeId) {
      return stripeId.stripeId;
    }
    return { status: 404, message: 'No stripe integration found' };
  } catch (error) {
    return { status: 500, message: 'Internal server error' };
  }
};
