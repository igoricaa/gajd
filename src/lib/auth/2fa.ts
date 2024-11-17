'use server';

import { db } from '../db';
import { sessions, users } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { decryptToString, encryptString } from './encryption';
import { generateRandomRecoveryCode } from './utils';

export async function resetUser2FAWithRecoveryCode(
  userId: number,
  recoveryCode: string
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const result = await tx
      .select({ recoveryCode: users.recoveryCode })
      .from(users)
      .where(eq(users.id, userId))
      .for('update')
      .limit(1);

    if (result.length < 1) {
      return false;
    }

    const encryptedRecoveryCode = result[0].recoveryCode;
    const userRecoveryCode = decryptToString(encryptedRecoveryCode);
    if (recoveryCode !== userRecoveryCode) {
      return false;
    }

    const newRecoveryCode = await generateRandomRecoveryCode();
    const encryptedNewRecoveryCode = encryptString(newRecoveryCode);

    await tx
      .update(sessions)
      .set({ twoFactorVerified: false })
      .where(eq(sessions.userId, userId));

    const res = await tx
      .update(users)
      .set({ recoveryCode: encryptedNewRecoveryCode, totpKey: null })
      .where(
        and(
          eq(users.id, userId),
          eq(users.recoveryCode, encryptedRecoveryCode)
        )
      )
      .returning();

    return res.length > 0;
  });
}
