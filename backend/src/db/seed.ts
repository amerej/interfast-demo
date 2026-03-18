import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import {
  user,
  account,
  projects,
  tasks,
  activities,
  comments,
} from './schema';
import { randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';

async function seed() {
  const dbUrl =
    process.env.DATABASE_URL ?? 'postgres://portal:portal@localhost:5432/portal';
  console.log('Seeding database...', dbUrl);

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  console.log('Cleaning existing data...');
  await db.execute(sql`TRUNCATE comments, activities, tasks, projects, account, session, verification, "user" CASCADE`);

  // --- Users ---
  const clientJeanId = 'client-jean-001';
  const clientMarieId = 'client-marie-001';

  const clientPassword = await hashPassword('client123');

  await db
    .insert(user)
    .values([
      {
        id: clientJeanId,
        name: 'Jean Dupont',
        email: 'client@example.com',
        emailVerified: true,
        role: 'client',
      },
      {
        id: clientMarieId,
        name: 'Marie Lambert',
        email: 'marie@example.com',
        emailVerified: true,
        role: 'client',
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(account)
    .values([
      { id: randomUUID(), accountId: clientJeanId, providerId: 'credential', userId: clientJeanId, password: clientPassword },
      { id: randomUUID(), accountId: clientMarieId, providerId: 'credential', userId: clientMarieId, password: clientPassword },
    ])
    .onConflictDoNothing();

  // --- Projects ---
  const projJean = '10000000-0000-0000-0000-000000000001';
  const projMarie = '10000000-0000-0000-0000-000000000003';

  await db
    .insert(projects)
    .values([
      {
        id: projJean,
        name: 'Rénovation maison Dupont',
        clientId: clientJeanId,
        status: 'in_progress',
        startDate: new Date('2026-01-12'),
        estimatedEndDate: new Date('2026-04-30'),
      },
      {
        id: projMarie,
        name: 'Installation chauffage',
        clientId: clientMarieId,
        status: 'in_progress',
        startDate: new Date('2026-02-03'),
        estimatedEndDate: new Date('2026-04-15'),
      },
    ])
    .onConflictDoNothing();

  // --- Tasks ---
  await db
    .insert(tasks)
    .values([
      { projectId: projJean, title: 'Câblage RDC', status: 'done' },
      { projectId: projJean, title: 'Câblage étage', status: 'doing' },
      { projectId: projJean, title: 'Pose tableau électrique', status: 'todo' },
      { projectId: projJean, title: 'Installation spots cuisine', status: 'todo' },
      { projectId: projMarie, title: 'Installation chaudière', status: 'done' },
      { projectId: projMarie, title: 'Pose radiateur salon', status: 'done' },
      { projectId: projMarie, title: 'Pose radiateur chambre 1', status: 'doing' },
    ])
    .onConflictDoNothing();

  // --- Activities ---
  const activityIds: string[] = [];
  const activityData = [
    { projectId: projJean, message: 'Projet créé', userId: clientJeanId },
    { projectId: projJean, message: 'Câblage RDC terminé', userId: clientJeanId },
    { projectId: projMarie, message: 'Chaudière installée et testée', userId: clientMarieId },
  ];

  for (const a of activityData) {
    const id = randomUUID();
    activityIds.push(id);
    await db
      .insert(activities)
      .values({ id, projectId: a.projectId, userId: a.userId, message: a.message })
      .onConflictDoNothing();
  }

  // --- Comments ---
  if (activityIds.length >= 2) {
    await db
      .insert(comments)
      .values([
        { activityId: activityIds[1], userId: clientJeanId, message: 'Super, merci pour la mise à jour !' },
      ])
      .onConflictDoNothing();
  }

  console.log('Seeding complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
