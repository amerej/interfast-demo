import { pgTable, uuid, text, timestamp, boolean, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const trades = pgTable('trades', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tradeCategories = pgTable('trade_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tradeId: uuid('trade_id')
    .notNull()
    .references(() => trades.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('client'),
  tradeId: uuid('trade_id').references(() => trades.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const proClients = pgTable(
  'pro_clients',
  {
    proId: text('pro_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.proId, t.clientId] })],
);

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    clientId: text('client_id').references(() => user.id, { onDelete: 'set null' }),
    proId: text('pro_id').references(() => user.id, { onDelete: 'set null' }),
    status: text('status').notNull().default('planning'),
    startDate: timestamp('start_date'),
    estimatedEndDate: timestamp('estimated_end_date'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('projects_client_id_idx').on(t.clientId),
    index('projects_pro_id_idx').on(t.proId),
  ],
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: text('status').notNull().default('todo'),
    category: text('category'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [index('tasks_project_id_idx').on(t.projectId)],
);

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [index('activities_project_id_idx').on(t.projectId)],
);

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activityAttachments = pgTable('activity_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    allDay: boolean('all_day').notNull().default(false),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('appointments_user_id_idx').on(t.userId),
    index('appointments_client_id_idx').on(t.clientId),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').notNull().default('activity'),
    message: text('message').notNull(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('notifications_user_id_idx').on(t.userId),
    index('notifications_user_read_idx').on(t.userId, t.read),
  ],
);

export const tradesRelations = relations(trades, ({ many }) => ({
  categories: many(tradeCategories),
  users: many(user),
}));

export const tradeCategoriesRelations = relations(tradeCategories, ({ one }) => ({
  trade: one(trades, { fields: [tradeCategories.tradeId], references: [trades.id] }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  trade: one(trades, { fields: [user.tradeId], references: [trades.id] }),
  clientProjects: many(projects, { relationName: 'clientProjects' }),
  proProjects: many(projects, { relationName: 'proProjects' }),
  activities: many(activities),
  comments: many(comments),
}));

export const proClientsRelations = relations(proClients, ({ one }) => ({
  pro: one(user, { fields: [proClients.proId], references: [user.id], relationName: 'proLinks' }),
  client: one(user, { fields: [proClients.clientId], references: [user.id], relationName: 'clientLinks' }),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  client: one(user, { fields: [projects.clientId], references: [user.id], relationName: 'clientProjects' }),
  pro: one(user, { fields: [projects.proId], references: [user.id], relationName: 'proProjects' }),
  tasks: many(tasks),
  activities: many(activities),
}));

export const taskRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
}));

export const activityRelations = relations(activities, ({ one, many }) => ({
  project: one(projects, { fields: [activities.projectId], references: [projects.id] }),
  user: one(user, { fields: [activities.userId], references: [user.id] }),
  comments: many(comments),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  activity: one(activities, { fields: [comments.activityId], references: [activities.id] }),
  user: one(user, { fields: [comments.userId], references: [user.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
  project: one(projects, { fields: [notifications.projectId], references: [projects.id] }),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  user: one(user, { fields: [appointments.userId], references: [user.id], relationName: 'proAppointments' }),
  client: one(user, { fields: [appointments.clientId], references: [user.id], relationName: 'clientAppointments' }),
}));
