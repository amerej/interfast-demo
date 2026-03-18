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
  trades,
  tradeCategories,
  proClients,
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
  await db.execute(sql`TRUNCATE comments, activities, tasks, projects, pro_clients, account, session, verification, "user", trade_categories, trades CASCADE`);


  // --- Trades ---
  const tradeData = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Électricité' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Plomberie' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Chauffage' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Menuiserie' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'Peinture' },
    { id: '00000000-0000-0000-0000-000000000006', name: 'Entreprise Générale' },
  ];

  await db.insert(trades).values(tradeData).onConflictDoNothing();

  // --- Trade Categories ---
  const categoryData = [
    { tradeId: tradeData[0].id, name: 'Câblage' },
    { tradeId: tradeData[0].id, name: 'Tableau électrique' },
    { tradeId: tradeData[0].id, name: 'Éclairage' },
    { tradeId: tradeData[0].id, name: 'Prises' },
    { tradeId: tradeData[1].id, name: 'Tuyauterie' },
    { tradeId: tradeData[1].id, name: 'Sanitaires' },
    { tradeId: tradeData[1].id, name: 'Robinetterie' },
    { tradeId: tradeData[1].id, name: 'Évacuation' },
    { tradeId: tradeData[2].id, name: 'Chaudière' },
    { tradeId: tradeData[2].id, name: 'Radiateurs' },
    { tradeId: tradeData[2].id, name: 'Plancher chauffant' },
    { tradeId: tradeData[2].id, name: 'Thermostat' },
    { tradeId: tradeData[3].id, name: 'Portes' },
    { tradeId: tradeData[3].id, name: 'Fenêtres' },
    { tradeId: tradeData[3].id, name: 'Placards' },
    { tradeId: tradeData[3].id, name: 'Parquet' },
    { tradeId: tradeData[4].id, name: 'Murs' },
    { tradeId: tradeData[4].id, name: 'Plafonds' },
    { tradeId: tradeData[4].id, name: 'Boiseries' },
    { tradeId: tradeData[4].id, name: 'Enduit' },
    { tradeId: tradeData[5].id, name: 'Gros œuvre' },
    { tradeId: tradeData[5].id, name: 'Second œuvre' },
    { tradeId: tradeData[5].id, name: 'Finitions' },
    { tradeId: tradeData[5].id, name: 'Coordination' },
  ];

  await db.insert(tradeCategories).values(categoryData).onConflictDoNothing();

  // --- Users ---
  const proElecId = 'pro-electricien-001';
  const proPlombId = 'pro-plombier-001';
  const proChauffId = 'pro-chauffagiste-001';
  const clientJeanId = 'client-jean-001';
  const clientMarieId = 'client-marie-001';

  const proPassword = await hashPassword('pro123');
  const clientPassword = await hashPassword('client123');

  await db
    .insert(user)
    .values([
      {
        id: proElecId,
        name: 'Pierre Martin',
        email: 'electricien@example.com',
        emailVerified: true,
        role: 'pro',
        tradeId: tradeData[0].id,
      },
      {
        id: proPlombId,
        name: 'Marc Leroy',
        email: 'plombier@example.com',
        emailVerified: true,
        role: 'pro',
        tradeId: tradeData[1].id,
      },
      {
        id: proChauffId,
        name: 'Sophie Bernard',
        email: 'chauffagiste@example.com',
        emailVerified: true,
        role: 'pro',
        tradeId: tradeData[2].id,
      },
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
      { id: randomUUID(), accountId: proElecId, providerId: 'credential', userId: proElecId, password: proPassword },
      { id: randomUUID(), accountId: proPlombId, providerId: 'credential', userId: proPlombId, password: proPassword },
      { id: randomUUID(), accountId: proChauffId, providerId: 'credential', userId: proChauffId, password: proPassword },
      { id: randomUUID(), accountId: clientJeanId, providerId: 'credential', userId: clientJeanId, password: clientPassword },
      { id: randomUUID(), accountId: clientMarieId, providerId: 'credential', userId: clientMarieId, password: clientPassword },
    ])
    .onConflictDoNothing();

  // --- Pro-Client Links ---
  await db
    .insert(proClients)
    .values([
      { proId: proElecId, clientId: clientJeanId },
      { proId: proElecId, clientId: clientMarieId },
      { proId: proPlombId, clientId: clientJeanId },
      { proId: proChauffId, clientId: clientMarieId },
    ])
    .onConflictDoNothing();

  // --- Projects ---
  const projElecJean = '10000000-0000-0000-0000-000000000001';
  const projPlombJean = '10000000-0000-0000-0000-000000000002';
  const projChauffMarie = '10000000-0000-0000-0000-000000000003';
  const projElecMarie = '10000000-0000-0000-0000-000000000004';

  await db
    .insert(projects)
    .values([
      {
        id: projElecJean,
        name: 'Électricité maison Dupont',
        clientId: clientJeanId,
        proId: proElecId,
        status: 'in_progress',
        startDate: new Date('2026-01-12'),
        estimatedEndDate: new Date('2026-04-30'),
      },
      {
        id: projPlombJean,
        name: 'Plomberie salle de bain',
        clientId: clientJeanId,
        proId: proPlombId,
        status: 'planning',
        startDate: new Date('2026-03-10'),
        estimatedEndDate: new Date('2026-05-20'),
      },
      {
        id: projChauffMarie,
        name: 'Installation chauffage',
        clientId: clientMarieId,
        proId: proChauffId,
        status: 'in_progress',
        startDate: new Date('2026-02-03'),
        estimatedEndDate: new Date('2026-04-15'),
      },
      {
        id: projElecMarie,
        name: 'Mise aux normes électriques',
        clientId: clientMarieId,
        proId: proElecId,
        status: 'planning',
        startDate: new Date('2026-04-07'),
        estimatedEndDate: new Date('2026-07-18'),
      },
    ])
    .onConflictDoNothing();

  // --- Tasks ---
  await db
    .insert(tasks)
    .values([
      { projectId: projElecJean, title: 'Tirage de câbles RDC', status: 'done', category: 'Câblage' },
      { projectId: projElecJean, title: 'Tirage de câbles étage', status: 'doing', category: 'Câblage' },
      { projectId: projElecJean, title: 'Pose tableau électrique', status: 'todo', category: 'Tableau électrique' },
      { projectId: projElecJean, title: 'Installation spots cuisine', status: 'todo', category: 'Éclairage' },
      { projectId: projElecJean, title: 'Pose prises salon', status: 'done', category: 'Prises' },
      { projectId: projElecJean, title: 'Pose prises chambres', status: 'doing', category: 'Prises' },

      { projectId: projPlombJean, title: 'Arrivée d\'eau SDB', status: 'todo', category: 'Tuyauterie' },
      { projectId: projPlombJean, title: 'Pose douche italienne', status: 'todo', category: 'Sanitaires' },
      { projectId: projPlombJean, title: 'Robinet lavabo', status: 'todo', category: 'Robinetterie' },
      { projectId: projPlombJean, title: 'Raccordement évacuation', status: 'todo', category: 'Évacuation' },

      { projectId: projChauffMarie, title: 'Installation chaudière', status: 'done', category: 'Chaudière' },
      { projectId: projChauffMarie, title: 'Pose radiateur salon', status: 'done', category: 'Radiateurs' },
      { projectId: projChauffMarie, title: 'Pose radiateur chambre 1', status: 'doing', category: 'Radiateurs' },
      { projectId: projChauffMarie, title: 'Plancher chauffant SDB', status: 'todo', category: 'Plancher chauffant' },
      { projectId: projChauffMarie, title: 'Programmation thermostat', status: 'todo', category: 'Thermostat' },

      { projectId: projElecMarie, title: 'Diagnostic installation', status: 'todo', category: 'Câblage' },
      { projectId: projElecMarie, title: 'Remplacement tableau', status: 'todo', category: 'Tableau électrique' },
      { projectId: projElecMarie, title: 'Mise à la terre', status: 'todo', category: 'Câblage' },
    ])
    .onConflictDoNothing();

  // --- Activities ---
  const activityIds: string[] = [];
  const activityData = [
    { projectId: projElecJean, message: 'Projet créé', userId: proElecId },
    { projectId: projElecJean, message: 'Câblage RDC terminé', userId: proElecId },
    { projectId: projElecJean, message: 'Début câblage étage', userId: proElecId },
    { projectId: projChauffMarie, message: 'Chaudière installée et testée', userId: proChauffId },
    { projectId: projChauffMarie, message: 'Pose radiateurs en cours', userId: proChauffId },
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
  if (activityIds.length >= 3) {
    await db
      .insert(comments)
      .values([
        { activityId: activityIds[1], userId: clientJeanId, message: 'Super, merci pour la mise à jour !' },
        { activityId: activityIds[2], userId: clientJeanId, message: 'Combien de temps pour l\'étage ?' },
        { activityId: activityIds[2], userId: proElecId, message: 'Environ 3 jours de travail.' },
        { activityId: activityIds[3], userId: clientMarieId, message: 'La chaudière fonctionne bien ?' },
        { activityId: activityIds[3], userId: proChauffId, message: 'Oui, tous les tests sont OK.' },
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
