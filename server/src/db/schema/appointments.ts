import { pgTable, uuid, text, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { appointmentStatusEnum } from './enums.js';
import { patients } from './patients.js';
import { users } from './users.js';

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    appointmentDate: timestamp('appointment_date', { withTimezone: true }).notNull(),
    status: appointmentStatusEnum('status').notNull().default('pending'),
    reason: text('reason').notNull(),
    notes: text('notes'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('appointments_reason_length_check', sql`length(trim(${table.reason})) >= 3`),
    index('idx_appointments_date_status').on(table.appointmentDate, table.status),
    index('idx_appointments_patient_date').on(table.patientId, table.appointmentDate.desc()),
    index('idx_appointments_patient_confirmed')
      .on(table.patientId, table.appointmentDate)
      .where(sql`${table.status} = 'confirmed'`),
  ],
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
