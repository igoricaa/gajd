import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';

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
});

export const resources = pgTable('resources', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  link: varchar('link', { length: 255 }).notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => resourceCategories.id),
  subcategoryId: integer('subcategory_id').references(
    () => resourceSubcategories.id
  ),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const resourceCategories = pgTable('resource_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
});

export const resourceSubcategories = pgTable('resource_subcategories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => resourceCategories.id, { onDelete: 'cascade' }),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Resource = InferSelectModel<typeof resources>;
export type NewResource = InferInsertModel<typeof resources>;
export type ResourceCategory = InferSelectModel<typeof resourceCategories>;
export type NewResourceCategory = InferInsertModel<typeof resourceCategories>;
export type ResourceSubcategory = InferSelectModel<
  typeof resourceSubcategories
>;
export type NewResourceSubcategory = InferInsertModel<
  typeof resourceSubcategories
>;

// export type EmailVerificationRequest = InferSelectModel<
//   typeof emailVerificationRequestTable
// >;
// export type Session = InferSelectModel<typeof sessions>;
