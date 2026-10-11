import bcrypt from 'bcrypt';
import { inArray, sql } from 'drizzle-orm';
import { db, pool } from './index.js';
import { users, patients, appointments } from './schema/index.js';
import { env } from '../config/env.js';

async function seed(): Promise<void> {
  // Sécurité absolue : interdiction stricte d'exécuter le seed en production
  if (env.NODE_ENV === 'production') {
    console.error('❌ ERREUR DE SÉCURITÉ : Le script de seed ne peut JAMAIS tourner en production !');
    process.exit(1);
  }

  console.log('🌱 Démarrage du seed idempotent ClinicFlow (mode upsert ciblé)...');

  // 1. Upsert des utilisateurs sur la clé unique email
  console.log('👤 Upsert des utilisateurs (1 admin, 2 staff) sur email unique...');
  const demoAdminPassword = 'AdminPassword123!';
  const demoStaffPassword = 'StaffPassword123!';

  const adminHash = await bcrypt.hash(demoAdminPassword, 12);
  const staffHash = await bcrypt.hash(demoStaffPassword, 12);

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        email: 'admin@clinicflow.local',
        passwordHash: adminHash,
        fullName: 'Dr. Sarah Alami',
        role: 'admin',
        isActive: true,
      },
      {
        email: 'staff1@clinicflow.local',
        passwordHash: staffHash,
        fullName: 'Mehdi Benani',
        role: 'staff',
        isActive: true,
      },
      {
        email: 'staff2@clinicflow.local',
        passwordHash: staffHash,
        fullName: 'Yasmine Mansouri',
        role: 'staff',
        isActive: true,
      },
    ])
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: sql`excluded.password_hash`,
        fullName: sql`excluded.full_name`,
        role: sql`excluded.role`,
        isActive: sql`excluded.is_active`,
        updatedAt: new Date(),
      },
    })
    .returning();

  const adminUser = insertedUsers.find((u) => u.email === 'admin@clinicflow.local');
  const staffUser1 = insertedUsers.find((u) => u.email === 'staff1@clinicflow.local');
  const staffUser2 = insertedUsers.find((u) => u.email === 'staff2@clinicflow.local');

  if (!adminUser || !staffUser1 || !staffUser2) {
    throw new Error('Échec de récupération des utilisateurs du seed');
  }

  // 2. Upsert des patients sur la clé unique cin
  console.log('🏥 Upsert des 5 patients sur CIN unique...');
  const insertedPatients = await db
    .insert(patients)
    .values([
      {
        fullName: 'Karim Tazi',
        cin: 'AB123456',
        phone: '+212600112233',
        birthDate: '1985-05-12',
        address: '12 Rue Zerktouni, Casablanca',
      },
      {
        fullName: 'Fatima Zahra Bennani',
        cin: 'CD234567',
        phone: '+212600223344',
        birthDate: '1992-09-24',
        address: '45 Avenue Hassan II, Rabat',
      },
      {
        fullName: 'Omar El Idrissi',
        cin: 'EF345678',
        phone: '+212600334455',
        birthDate: '1978-01-15',
        address: '8 Boulevard Mohammed V, Marrakech',
      },
      {
        fullName: 'Khadija Alaoui',
        cin: 'GH456789',
        phone: '+212600445566',
        birthDate: '1999-11-03',
        address: '27 Rue de Fès, Tanger',
      },
      {
        fullName: 'Youssef Chaoui',
        cin: 'JK567890',
        phone: '+212600556677',
        birthDate: '2004-03-30',
        address: '3 Rue Ibn Batouta, Agadir',
      },
    ])
    .onConflictDoUpdate({
      target: patients.cin,
      set: {
        fullName: sql`excluded.full_name`,
        phone: sql`excluded.phone`,
        birthDate: sql`excluded.birth_date`,
        address: sql`excluded.address`,
        deletedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning();

  const seedPatientIds = insertedPatients.map((p) => p.id);

  // 3. Suppression UNIQUEMENT des rendez-vous des 5 patients du seed
  console.log('🧹 Purge ciblée des rendez-vous existants pour les 5 patients du seed uniquement...');
  await db.delete(appointments).where(inArray(appointments.patientId, seedPatientIds));

  // 4. Insertion des 10 rendez-vous (dates relatives à now(), au moins 3 RDV aujourd'hui)
  console.log('📅 Insertion des 10 rendez-vous pour les 5 patients...');
  const now = new Date();

  const p1 = insertedPatients.find((p) => p.cin === 'AB123456')!;
  const p2 = insertedPatients.find((p) => p.cin === 'CD234567')!;
  const p3 = insertedPatients.find((p) => p.cin === 'EF345678')!;
  const p4 = insertedPatients.find((p) => p.cin === 'GH456789')!;
  const p5 = insertedPatients.find((p) => p.cin === 'JK567890')!;

  const todayMorning = new Date(now);
  todayMorning.setHours(9, 30, 0, 0);

  const todayMidday = new Date(now);
  todayMidday.setHours(11, 30, 0, 0);

  const todayAfternoon = new Date(now);
  todayAfternoon.setHours(14, 0, 0, 0);

  const todayLate = new Date(now);
  todayLate.setHours(16, 30, 0, 0);

  const tomorrowMorning = new Date(now);
  tomorrowMorning.setDate(now.getDate() + 1);
  tomorrowMorning.setHours(10, 0, 0, 0);

  const tomorrowNoon = new Date(now);
  tomorrowNoon.setDate(now.getDate() + 1);
  tomorrowNoon.setHours(11, 30, 0, 0);

  const tomorrowAfternoon = new Date(now);
  tomorrowAfternoon.setDate(now.getDate() + 1);
  tomorrowAfternoon.setHours(15, 0, 0, 0);

  const inTwoDays = new Date(now);
  inTwoDays.setDate(now.getDate() + 2);
  inTwoDays.setHours(10, 30, 0, 0);

  const inThreeDays = new Date(now);
  inThreeDays.setDate(now.getDate() + 3);
  inThreeDays.setHours(14, 30, 0, 0);

  const inFourDays = new Date(now);
  inFourDays.setDate(now.getDate() + 4);
  inFourDays.setHours(16, 0, 0, 0);

  await db.insert(appointments).values([
    // Rendez-vous d'aujourd'hui (4 au total : 3 confirmés, 1 pending)
    {
      patientId: p1.id,
      appointmentDate: todayMorning,
      status: 'confirmed',
      reason: 'Consultation de cardiologie préventive',
      notes: 'Patient régulier',
      createdBy: adminUser.id,
    },
    {
      patientId: p2.id,
      appointmentDate: todayMidday,
      status: 'confirmed',
      reason: 'Suivi post-opératoire',
      notes: 'Vérifier cicatrisation',
      createdBy: staffUser1.id,
    },
    {
      patientId: p3.id,
      appointmentDate: todayAfternoon,
      status: 'pending',
      reason: 'Douleurs lombaires persistantes',
      notes: 'Première visite',
      createdBy: staffUser2.id,
    },
    {
      patientId: p1.id,
      appointmentDate: todayLate, // Même patient p1 mais 7h plus tard (> 30 min)
      status: 'confirmed',
      reason: 'Lecture des résultats sanguins',
      notes: null,
      createdBy: staffUser1.id,
    },

    // Rendez-vous de demain (3 au total)
    {
      patientId: p4.id,
      appointmentDate: tomorrowMorning,
      status: 'confirmed',
      reason: 'Visite médicale de contrôle annuel',
      notes: null,
      createdBy: adminUser.id,
    },
    {
      patientId: p4.id,
      appointmentDate: tomorrowNoon, // Même patient p4 mais 1h30 plus tard (> 30 min)
      status: 'confirmed',
      reason: 'Électrocardiogramme de repos',
      notes: null,
      createdBy: staffUser1.id,
    },
    {
      patientId: p5.id,
      appointmentDate: tomorrowAfternoon,
      status: 'pending',
      reason: 'Certificat médical pour aptitude sportive',
      notes: 'Étudiant en sport',
      createdBy: staffUser2.id,
    },

    // Rendez-vous futurs (3 au total)
    {
      patientId: p2.id,
      appointmentDate: inTwoDays,
      status: 'pending',
      reason: 'Contrôle dermatologique',
      notes: null,
      createdBy: staffUser1.id,
    },
    {
      patientId: p3.id,
      appointmentDate: inThreeDays,
      status: 'cancelled',
      reason: 'Bilan nutritionnel',
      notes: 'Annulé par le patient (déplacement professionnel)',
      createdBy: adminUser.id,
    },
    {
      patientId: p5.id,
      appointmentDate: inFourDays,
      status: 'cancelled',
      reason: 'Rappel de vaccination',
      notes: 'Annulé pour reprogrammation ultérieure',
      createdBy: staffUser2.id,
    },
  ]);

  console.log('✅ Seed ciblé terminé avec succès sans impacter les données existantes tierces !');

  console.log('\n======================================================');
  console.log('🔐 COMPTES DE DÉMONSTRATION DU SEED :');
  console.log('======================================================');
  console.table([
    {
      Rôle: 'admin',
      Email: 'admin@clinicflow.local',
      'Mot de passe démo': demoAdminPassword,
      Nom: 'Dr. Sarah Alami',
    },
    {
      Rôle: 'staff',
      Email: 'staff1@clinicflow.local',
      'Mot de passe démo': demoStaffPassword,
      Nom: 'Mehdi Benani',
    },
    {
      Rôle: 'staff',
      Email: 'staff2@clinicflow.local',
      'Mot de passe démo': demoStaffPassword,
      Nom: 'Yasmine Mansouri',
    },
  ]);
  console.log('======================================================\n');
}

seed()
  .catch((err) => {
    console.error('❌ Erreur lors du seed :', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
