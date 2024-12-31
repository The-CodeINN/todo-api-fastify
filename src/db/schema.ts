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
    status: statusEnum('status').notNull().default('active'),
    completed: boolean('completed').notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index('search_index').using(
      'gin',
      sql`(
          setweight(to_tsvector('english', ${table.title}), 'A') ||
          setweight(to_tsvector('english', ${table.description}), 'B')
      )`
    ),
  ]
);
