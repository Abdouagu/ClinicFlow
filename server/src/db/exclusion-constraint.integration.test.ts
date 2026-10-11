import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as schema from './schema/index.js';
import { users, patients, appointments } from './schema/index.js';

const { Pool } = pg;

interface PgDatabaseError extends Error {
  code?: string;
  cause?: {
    code?: string;
  };
}

const testDatabaseUrl = process.env['TEST_DATABASE_URL'];

describe.skipIf(!testDatabaseUrl)(
  'PostgreSQL Exclusion Constraint (Integration Test)',
  () => {
    let testPool: pg.Pool;
    let testDb: ReturnType<typeof drizzle<typeof schema>>;
    let testUserId: string;
    let testPatientId: string;

    beforeAll(async () => {
      // 1. Contrôle de sécurité strict : interdiction de pointer sur la DB dev/prod
      const directUrl = process.env['DATABASE_URL_DIRECT'];
      const pooledUrl = process.env['DATABASE_URL'];

      if (
        testDatabaseUrl === directUrl ||
        testDatabaseUrl === pooledUrl
      ) {
        throw new Error(
          'DANGER DE SÉCURITÉ : TEST_DATABASE_URL ne doit jamais être identique à DATABASE_URL ou DATABASE_URL_DIRECT !',
        );
      }

      // 2. Connexion dédiée UNIQUEMENT via TEST_DATABASE_URL
      testPool = new Pool({
        connectionString: testDatabaseUrl,
        max: 2,
      });
      testDb = drizzle(testPool, { schema });

      // 3. Préparation des données de test isolées
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      const testEmail = `test_constraint_user_${Date.now()}@clinicflow.local`;
      const testCin = `TST${Date.now().toString().slice(-6)}`;

      const [user] = await testDb
        .insert(users)
        .values({
          email: testEmail,
          passwordHash,
          fullName: 'Dr. Test Constraint',
          role: 'staff',
          isActive: true,
        })
        .returning({ id: users.id });

      const [patient] = await testDb
        .insert(patients)
        .values({
          fullName: 'Patient Test Concurrence',
          cin: testCin,
          phone: '+212600998877',
          birthDate: '1990-01-01',
        })
        .returning({ id: patients.id });

      if (!user || !patient) {
        throw new Error('Échec d initialisation des entités de test');
      }

      testUserId = user.id;
      testPatientId = patient.id;
    });

    afterAll(async () => {
      // 4. Nettoyage de ses propres données uniquement
      if (testDb && testPatientId) {
        await testDb.delete(appointments).where(eq(appointments.patientId, testPatientId));
        await testDb.delete(patients).where(eq(patients.id, testPatientId));
      }
      if (testDb && testUserId) {
        await testDb.delete(users).where(eq(users.id, testUserId));
      }
      if (testPool) {
        await testPool.end();
      }
    });

    it('devrait REJETER un 2ème RDV confirmé à 10 minutes d écart avec l erreur SQL 23P01', async () => {
      const baseDate = new Date('2027-01-15T10:00:00.000Z');
      const conflictingDate = new Date('2027-01-15T10:10:00.000Z'); // 10 minutes après (< 30 min)

      // Premier rendez-vous confirmé
      await testDb.insert(appointments).values({
        patientId: testPatientId,
        appointmentDate: baseDate,
        status: 'confirmed',
        reason: 'Premier rendez-vous de base',
        createdBy: testUserId,
      });

      // Deuxième rendez-vous confirmé à 10 min : doit échouer avec l'erreur 23P01
      let errorCaught: PgDatabaseError | null = null;
      try {
        await testDb.insert(appointments).values({
          patientId: testPatientId,
          appointmentDate: conflictingDate,
          status: 'confirmed',
          reason: 'Rendez-vous concurrent en conflit',
          createdBy: testUserId,
        });
      } catch (err) {
        errorCaught = err as PgDatabaseError;
      }

      expect(errorCaught).not.toBeNull();
      // Lecture robuste de error.cause?.code ?? error.code
      const sqlErrorCode = errorCaught?.cause?.code ?? errorCaught?.code;
      expect(sqlErrorCode).toBe('23P01');
    });

    it('devrait ACCEPTER un 2ème RDV confirmé espacé d exactement 30 minutes', async () => {
      const baseDate = new Date('2027-02-20T14:00:00.000Z');
      const validDate = new Date('2027-02-20T14:30:00.000Z'); // Exactement 30 min après

      // RDV 1 à 14:00
      await testDb.insert(appointments).values({
        patientId: testPatientId,
        appointmentDate: baseDate,
        status: 'confirmed',
        reason: 'Premier créneau valide',
        createdBy: testUserId,
      });

      // RDV 2 à 14:30 : valide
      const [secondAppointment] = await testDb
        .insert(appointments)
        .values({
          patientId: testPatientId,
          appointmentDate: validDate,
          status: 'confirmed',
          reason: 'Deuxième créneau consécutif valide',
          createdBy: testUserId,
        })
        .returning();

      expect(secondAppointment).toBeDefined();
      expect(secondAppointment?.status).toBe('confirmed');
    });

    it('devrait ACCEPTER un RDV à 10 minutes d écart si le statut n est PAS confirmed', async () => {
      const baseDate = new Date('2027-03-10T09:00:00.000Z');
      const dateAt10Min = new Date('2027-03-10T09:10:00.000Z');

      // RDV 1 confirmé à 09:00
      await testDb.insert(appointments).values({
        patientId: testPatientId,
        appointmentDate: baseDate,
        status: 'confirmed',
        reason: 'Consultation confirmée',
        createdBy: testUserId,
      });

      // RDV 2 à 09:10 mais statut 'pending' : accepté car exclu de la contrainte
      const [pendingAppointment] = await testDb
        .insert(appointments)
        .values({
          patientId: testPatientId,
          appointmentDate: dateAt10Min,
          status: 'pending',
          reason: 'Demande en attente',
          createdBy: testUserId,
        })
        .returning();

      expect(pendingAppointment).toBeDefined();
      expect(pendingAppointment?.status).toBe('pending');
    });
  },
);
