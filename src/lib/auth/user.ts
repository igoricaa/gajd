'use server';

import { eq, InferInsertModel } from 'drizzle-orm';
import { db } from '../db';
import { User, users } from '../db/schema';
import { hashPassword } from './password';

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const result = await db
    .insert(users)
    .values({
      username: username,
      email,
      passwordHash,
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
  };

  const [result]: User[] = await db.insert(users).values(user).returning();

  return result;
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

export async function updateUserPassword(
  userId: number,
  password: string
): Promise<void> {
  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

type UserInsert = InferInsertModel<typeof users>;
