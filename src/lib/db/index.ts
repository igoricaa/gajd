import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';
import { users } from './schema';
import { eq } from 'drizzle-orm';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

export const db = drizzle(process.env.DATABASE_URL);

// async function main() {
//   const user: typeof usersTable.$inferInsert = {
//     username: 'john_doe',
//     name: 'John',
//     age: 30,
//     email: 'john@example.com',
//     passwordHash: 'password',
//     recoveryCode: new Uint8Array(),
//   };
//   await db.insert(users).values(user);
//   console.log('New user created!');
//   const users = await db.select().from(users);
//   console.log('Getting all users from the database: ', users);

//   await db
//     .update(users)
//     .set({
//       age: 31,
//     })
//     .where(eq(users.email, user.email));
//   console.log('User info updated!');
//   await db.delete(users).where(eq(users.email, user.email));
//   console.log('User deleted!');
// }
// main();
