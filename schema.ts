import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  email: text('email').notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().unique(),
  title: text('title').notNull(),
  lastMessageDate: timestamp('last_message_date').defaultNow().notNull(),
  userId: uuid('user_id').references(() => profiles.userId).notNull()
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.sessionId),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});
