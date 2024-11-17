'use server';

import { eq, InferInsertModel } from 'drizzle-orm';
import { db } from '../db';
import { User, users } from '../db/schema';
import { decrypt, decryptToString, encryptString } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCode } from './utils';

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const recoveryCode = await generateRandomRecoveryCode();
  const encryptedRecoveryCode = encryptString(recoveryCode);

  const result = await db
    .insert(users)
    .values({
      username: username,
      email,
      passwordHash,
      recoveryCode: encryptedRecoveryCode,
    })
    .returning();

  if (result.length < 1) {
    throw new Error('Failed to create user');
  }

  // TODO: do i need to return everything? .returning({id: users.id, email: users.email}) ?
  // same for other inserts?
  return result[0];
}

export async function createUserGithub(
  githubId: string,
  githubUsername: string,
  githubEmail: string
): Promise<User> {
  const user: UserInsert = {
    name: githubUsername,
    email: githubEmail,
    username: githubUsername,
    githubId,
    passwordHash: '',
    recoveryCode: new Uint8Array(),
  };

  const [result]: User[] = await db.insert(users).values(user).returning();

  return result;
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
  const recoveryCode = await generateRandomRecoveryCode();
  const encrypted = encryptString(recoveryCode);

  await db
    .update(users)
    .set({ recoveryCode: encrypted })
    .where(eq(users.id, userId));

  return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length < 1) {
    return null;
  }

  return user[0];
}

export async function getUserByGithubId(
  githubId: string
): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .limit(1);

  if (user.length < 1) {
    return null;
  }

  return user[0];
}

export async function getUserPasswordHash(userId: number): Promise<string> {
  const passwordHash = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (passwordHash.length < 1) {
    throw new Error('Invalid user ID');
  }

  return passwordHash[0].passwordHash;
}

export async function verifyUsernameInput(username: string): Promise<boolean> {
  return (
    username.length > 3 && username.length < 32 && username.trim() === username
  );
}

export async function updateUserEmailAndSetEmailAsVerified(
  userId: number,
  email: string
): Promise<void> {
  await db
    .update(users)
    .set({ emailVerified: true, email })
    .where(eq(users.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
  userId: number,
  email: string
): Promise<boolean> {
  const result = await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, userId) && eq(users.email, email))
    .returning();

  return result.length > 0;
}

export async function getUserRecoveryCode(userId: number): Promise<string> {
  const result = await db
    .select({ recoveryCode: users.recoveryCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length < 1) {
    throw new Error('Invalid user ID');
  }

  return decryptToString(result[0].recoveryCode);
}

export async function getUserTOTPKey(
  userId: number
): Promise<Uint8Array | null> {
  const result = await db
    .select({ totpKey: users.totpKey })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length < 1) {
    throw new Error('Invalid user ID');
  }

  const encrypted = result[0].totpKey;
  if (!encrypted) {
    return null;
  }

  return decrypt(encrypted);
}

export async function updateUserTOTPKey(
  userId: number,
  totpKey: Uint8Array
): Promise<void> {
  await db.update(users).set({ totpKey }).where(eq(users.id, userId));
}

export async function updateUserPassword(
  userId: number,
  password: string
): Promise<void> {
  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}

type UserInsert = InferInsertModel<typeof users>;
