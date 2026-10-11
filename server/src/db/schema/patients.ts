import { pgTable, uuid, varchar, text, date, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const patients = pgTable(
  'patients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: varchar('full_name', { length: 150 }).notNull(),
    cin: varchar('cin', { length: 20 }).notNull().unique(),
    phone: varchar('phone', { length: 30 }).notNull(),
    birthDate: date('birth_date', { mode: 'string' }).notNull(),
    address: text('address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    check('patients_birth_date_min_check', sql`${table.birthDate} >= '1900-01-01'`),
    check('patients_full_name_length_check', sql`length(trim(${table.fullName})) >= 2`),
    check('patients_cin_length_check', sql`length(trim(${table.cin})) >= 2`),
  ],
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
