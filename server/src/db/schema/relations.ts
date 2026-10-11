import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { patients } from './patients.js';
import { appointments } from './appointments.js';

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  createdByUser: one(users, {
    fields: [appointments.createdBy],
    references: [users.id],
  }),
}));
