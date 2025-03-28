'use server';

import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { type ActionResponse } from '@/types/actions';
import { db } from '@/lib/db';
import { getUser } from '@/lib/data/user';
import { appErrors } from '@/lib/errors';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(30),
  username: z.string().min(2).max(30),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
});

export const updateProfile = createSafeActionClient()
  .schema(updateProfileSchema)
  .action(async (input): Promise<ActionResponse> => {
    try {
      const user = await getUser();

      if (!user) {
        return {
          success: false,
          error: appErrors.UNAUTHORIZED,
        };
      }

      // const userUpdated = await db.user.update({
      //   where: { id: session.user.id },
      //   data: {
      //     name: input.name,
      //     username: input.username,
      //     email: input.email,
      //     bio: input.bio,
      //   },
      // });

      return {
        success: true,
        // message: 'Profile updated successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: appErrors.UPDATE_PROFILE_FAILED,
      };
    }
  });
