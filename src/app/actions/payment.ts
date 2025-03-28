// 'use server';

// import { createSafeActionClient } from 'next-safe-action';
// import { z } from 'zod';
// import type { ActionResponse } from '@/types/actions';

// import Stripe from 'stripe';
// import { getUser } from '@/lib/data/user';
// import { verifySession } from '@/lib/auth/session';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// });

// export async function getPaymentMethods(): Promise<ActionResponse> {
//   try {
//     const { userId, sessionId } = await verifySession();
//     const user = await getUser();
//     if (!user) {
//       return {
//         success: false,
//         error: { message: 'Unauthorized' },
//       };
//     }

//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: session.user.stripeCustomerId,
//       type: 'card',
//     });

//     return {
//       success: true,
//       data: paymentMethods.data,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: { message: 'Failed to fetch payment methods' },
//     };
//   }
// }

// const addPaymentMethodSchema = z.object({
//   paymentMethodId: z.string(),
// });

// export const addPaymentMethod = createSafeActionClient()
//   .schema(addPaymentMethodSchema)
//   .action(async (input): Promise<ActionResponse> => {
//     try {
//       const session = await auth();
//       if (!session?.user) {
//         return {
//           success: false,
//           error: { message: 'Unauthorized' },
//         };
//       }

//       const paymentMethod = await stripe.paymentMethods.attach(
//         input.paymentMethodId,
//         {
//           customer: session.user.stripeCustomerId,
//         }
//       );

//       return {
//         success: true,
//         data: paymentMethod,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: { message: 'Failed to add payment method' },
//       };
//     }
//   });

// const removePaymentMethodSchema = z.object({
//   paymentMethodId: z.string(),
// });

// export const removePaymentMethod = createSafeActionClient()
//   .schema(removePaymentMethodSchema)
//   .action(async (input): Promise<ActionResponse> => {
//     try {
//       const session = await auth();
//       if (!session?.user) {
//         return {
//           success: false,
//           error: { message: 'Unauthorized' },
//         };
//       }

//       await stripe.paymentMethods.detach(input.paymentMethodId);

//       return {
//         success: true,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: { message: 'Failed to remove payment method' },
//       };
//     }
//   });
