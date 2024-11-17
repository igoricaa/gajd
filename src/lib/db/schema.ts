import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  customType,
  pgEnum,
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Uint8Array; driverData: string | Buffer }>({
  dataType() {
    return 'bytea';
  },
  toDriver(value: Uint8Array): string {
    return `\\x${Buffer.from(value).toString('hex')}`;
  },
  fromDriver(value: string | Buffer): Uint8Array {
    if (Buffer.isBuffer(value)) {
      return new Uint8Array(value);
    }
    // Handle string format
    const hexString =
      typeof value === 'string' && value.startsWith('\\x')
        ? value.substring(2)
        : value;
    return new Uint8Array(Buffer.from(hexString, 'hex'));
  },
});

export const roleEnum = pgEnum('role', ['member', 'admin']);
export const accountTypeEnum = pgEnum('type', ['email', 'google', 'github']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  username: varchar('username', { length: 255 }).notNull().unique(),
  age: integer(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  githubId: varchar('github_id', { length: 255 }).unique(),
  role: roleEnum('role').notNull().default('member'),
  accountType: accountTypeEnum('account_type').notNull().default('email'),
  emailVerified: boolean('email_verified').notNull().default(false),
  registered2FA: boolean('registered_2fa').notNull().default(false),
  recoveryCode: bytea('recovery_code').notNull(),
  totpKey: bytea('totp_key'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  twoFactorVerified: boolean('two_factored_verified').notNull().default(false),
});

export const emailVerificationRequest = pgTable('email_verification_request', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  code: varchar('code', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const passwordResetSession = pgTable('password_reset_session', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  twoFactorVerified: boolean('two_factor_verified').notNull().default(false),
});

export type User = InferSelectModel<typeof users>;
// export type EmailVerificationRequest = InferSelectModel<
//   typeof emailVerificationRequestTable
// >;
// export type Session = InferSelectModel<typeof sessions>;
