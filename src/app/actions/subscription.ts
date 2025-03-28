'use server';

import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import type { ActionResponse } from '@/types/actions';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { getUser } from '@/lib/data/user';
import { appErrors } from '@/lib/errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function getCurrentSubscription(): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // const subscription = await stripe.subscriptions.retrieve(
    //   session.user.stripeSubscriptionId
    // );

    return {
      success: true,
      // data: subscription,
    };
  } catch (error) {
    return {
      success: false,
      error: appErrors.FAILED_TO_FETCH_SUBSCRIPTION,
    };
  }
}

export async function getAvailablePlans(): Promise<ActionResponse> {
  try {
    const plans = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    return {
      success: true,
      data: plans.data,
    };
  } catch (error) {
    return {
      success: false,
      error: appErrors.FAILED_TO_FETCH_PLANS,
    };
  }
}

export async function getSubscriptionHistory(): Promise<ActionResponse> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // const invoices = await stripe.invoices.list({
    //   customer: session.user.stripeCustomerId,
    //   limit: 100,
    // });

    return {
      success: true,
      // data: invoices.data,
    };
  } catch (error) {
    return {
      success: false,
      error: appErrors.FAILED_TO_FETCH_SUBSCRIPTION_HISTORY,
    };
  }
}

const updateSubscriptionSchema = z.object({
  priceId: z.string(),
});

export const updateSubscription = createSafeActionClient()
  .schema(updateSubscriptionSchema)
  .action(async (input): Promise<ActionResponse> => {
    try {
      const user = await getUser();
      if (!user) {
        return {
          success: false,
          error: appErrors.UNAUTHORIZED,
        };
      }

      // const subscription = await stripe.subscriptions.update(
      //   session.user.stripeSubscriptionId,
      //   {
      //     items: [
      //       {
      //         id: session.user.stripeSubscriptionItemId,
      //         price: input.priceId,
      //       },
      //     ],
      //   }
      // );

      return {
        success: true,
        // data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        error: appErrors.FAILED_TO_UPDATE_SUBSCRIPTION,
      };
    }
  });

const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
});

export const cancelSubscription = createSafeActionClient()
  .schema(cancelSubscriptionSchema)
  .action(async (input): Promise<ActionResponse> => {
    try {
      const user = await getUser();
      if (!user) {
        return {
          success: false,
          error: appErrors.UNAUTHORIZED,
        };
      }

      // const subscription = await stripe.subscriptions.cancel(
      //   session.user.stripeSubscriptionId,
      //   {
      //     cancellation_details: {
      //       comment: input.reason,
      //     },
      //   }
      // );

      return {
        success: true,
        // data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        error: appErrors.FAILED_TO_CANCEL_SUBSCRIPTION,
      };
    }
  });
