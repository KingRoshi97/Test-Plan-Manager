import { pgTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define your tables here based on locked documentation
// Example:
// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   email: varchar('email', { length: 255 }).notNull().unique(),
//   createdAt: timestamp('created_at').defaultNow(),
// });