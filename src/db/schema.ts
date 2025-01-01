import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  integer,
  boolean,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const statuses = ['pending', 'active', 'completed'] as const;
export const statusEnum = pgEnum('status', statuses);

export const tasks = pgTable(
  'tasks',
  {
    id: text('id')
      .primaryKey()
      .$default(() => randomUUID())
      .notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: statusEnum('status').notNull().default('pending'),
    completed: boolean().notNull().default(false),
    ...timestamps,
  }
  // (table) => [
  //   index('search_index').using(
  //     'gin',
  //     sql`(
  //         setweight(to_tsvector('english', ${table.title}), 'A') ||
  //         setweight(to_tsvector('english', ${table.description}), 'B')
  //     )`
  //   ),
  // ]
);

export const selectTasksSchema = createSelectSchema(tasks);

// Create base insert schema
const baseInsertSchema = createInsertSchema(tasks);

// Extend the base schema with custom validations
export const insertTasksSchema = baseInsertSchema
  .extend({
    title: z.string().min(1).max(500),
    description: z.string().min(1),
    status: z.enum(statuses),
    completed: z.boolean(),
  })
  .pick({
    title: true,
    description: true,
    status: true,
    completed: true,
  });

export const patchTasksSchema = insertTasksSchema.partial();

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<NewTask>;
