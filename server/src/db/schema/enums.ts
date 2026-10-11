import { pgEnum } from 'drizzle-orm/pg-core';

// Énumération des rôles applicatifs
export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);

// Énumération des statuts de rendez-vous
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'cancelled',
]);
