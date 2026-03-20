# Interfast Portal

Portail client SaaS pour entreprises du BTP. Permet aux professionnels de gérer leurs projets et à leurs clients de suivre l'avancement en temps réel.

---

## Démarrage rapide

```bash
docker compose up --build
```

Accès : [http://localhost:8080](http://localhost:8080)

### Comptes de démonstration

| Rôle   | Email              | Mot de passe |
| ------ | ------------------ | ------------ |
| Pro    | pro@example.com    | pro123       |
| Client | client@example.com | client123    |

---

## Stack technique

| Couche           | Technologie                                       |
| ---------------- | ------------------------------------------------- |
| Base de données  | PostgreSQL 15                                     |
| ORM              | Drizzle ORM + drizzle-kit                         |
| Backend          | NestJS                                            |
| Tests backend    | Jest + ts-jest + @nestjs/testing                  |
| Authentification | Better Auth (email/password, sessions HTTP cookie) |
| Temps réel       | Socket.io (WebSockets)                            |
| Frontend         | React 19 + React Router v7 + Vite                |
| État serveur     | TanStack React Query                              |
| Formulaires      | React Hook Form + Zod                             |
| Tests frontend   | Vitest + React Testing Library + jsdom            |
| Style            | TailwindCSS v4 + ShadcnUI (Radix UI)             |
| Graphiques       | Recharts                                          |
| Calendrier       | react-big-calendar + date-fns                     |
| Proxy            | Nginx                                             |
| Conteneurs       | Docker + Docker Compose                           |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│               Nginx :8080                   │
│   /           →  Frontend (React/Vite)      │
│   /backend/*  →  Backend (NestJS)           │
└─────────────────────────────────────────────┘
         │                    │
   Frontend :5173        Backend :3000
                               │
                        PostgreSQL :5432
```

---

### Modules backend (NestJS)

| Module          | Responsabilité                                             |
| --------------- | ---------------------------------------------------------- |
| `auth`          | Délégation à Better Auth (catch-all route)                 |
| `users`         | Profil utilisateur                                         |
| `projects`      | CRUD projets, calcul de progression, émission Socket.io    |
| `tasks`         | Gestion des tâches, mise à jour statut, émission Socket.io |
| `activities`    | Journal d'activités, **WebSocket gateway** (Socket.io)     |
| `comments`      | Commentaires sur activités, émission Socket.io             |
| `appointments`  | Rendez-vous / agenda (CRUD, lié aux projets)               |
| `notifications` | Notifications in-app temps réel (client)                   |
| `trades`        | Métiers et catégories (électricien, plombier…)             |
| `pro-clients`   | Liens entre professionnels et clients                      |

### Features frontend (React)

| Feature    | Description                                           |
| ---------- | ----------------------------------------------------- |
| `auth`     | Connexion client                                      |
| `projects` | Liste projets, dashboard, progression, tâches         |
| `users`    | Page profil utilisateur                               |
| `agenda`   | Calendrier avec vue mensuelle (react-big-calendar)    |
| `pro`      | Espace professionnel (projets, clients, formulaires)  |

---

### Schéma de base de données

```
trades ─────────────── trade_categories
  │
  └── user (role: admin | client | pro | artisan)
        │
        ├── pro_clients (proId ↔ clientId)
        ├── notifications (userId)
        │
        └── projects (clientId, proId)
              │
              ├── tasks (status: todo | doing | done)
              ├── appointments (projectId)
              │
              └── activities (userId)
                    │
                    └── comments (userId)
```

Tables Better Auth gérées automatiquement : `session`, `account`, `verification`.

---

### Authentification (Better Auth)

- Transport : cookie de session HTTP
- Stratégie : email + mot de passe
- Champs personnalisés sur `user` : `role`, `tradeId`
- Guard NestJS `AuthGuard` + décorateur `@User()` pour injecter l'utilisateur courant
- Guard `RolesGuard` + décorateur `@Roles()` pour le contrôle d'accès par rôle

### Temps réel (Socket.io)

Namespace WebSocket : `/ws` — accessible via `/backend/socket.io`.

**Rooms :**

- `project:{projectId}` — suivi d'un projet spécifique
- `client:{clientId}` — notifications globales d'un client

**Événements serveur → client :**

| Événement       | Émis par                               | Room ciblée           |
| --------------- | -------------------------------------- | --------------------- |
| `newActivity`   | `ActivitiesService.create`             | `project:{projectId}` |
| `newComment`    | `CommentsService.create`               | `project:{projectId}` |
| `taskUpdate`    | `TasksService.create/update`           | `project:{projectId}` |
| `projectUpdate` | `ProjectsService.create/update/remove` | `client:{clientId}`   |

---

### Routing frontend

| Route               | Composant           | Protection | Rôle   |
| ------------------- | ------------------- | ---------- | ------ |
| `/`                 | RootRedirect        | session    | —      |
| `/auth`             | AuthPage            | —          | —      |
| `/projects`         | ProjectsPage        | ✓          | client |
| `/projects/:id`     | ProjectDashboard    | ✓          | client |
| `/user/:id`         | UserPage            | ✓          | client |
| `/agenda`           | AgendaPage          | ✓          | client |
| `/pro/auth`         | ProAuthPage         | —          | —      |
| `/pro/projects`     | ProProjectsPage     | ✓          | pro    |
| `/pro/projects/new` | ProProjectForm      | ✓          | pro    |
| `/pro/projects/:id` | ProProjectDashboard | ✓          | pro    |
| `/pro/clients`      | ProClientsPage      | ✓          | pro    |

Deux layouts distincts : `<Layout>` (client) et `<ProLayout>` (professionnel).

---

## Tests

### Backend (Jest)

```bash
docker compose exec backend npm test          # tous les tests
docker compose exec backend npm run test:cov   # avec couverture
```

10 fichiers de tests couvrant controllers et services :
`auth`, `users`, `projects`, `tasks`, `activities`, `comments`, `roles.guard`

### Frontend (Vitest + React Testing Library)

```bash
docker compose exec frontend npm test          # tous les tests
docker compose exec frontend npm run test:watch # mode watch
```

8 fichiers de tests couvrant :
`App`, `AuthPage`, `ProjectsPage`, `ProjectSummary`, `TaskChecklist`, `UserPage`, `api`, `use-theme`

---

## Infrastructure Docker

```yaml
services:
  postgres   # PostgreSQL 15 — données persistées dans un volume
  backend    # NestJS — hot-reload via volume sur /app/src
  frontend   # Vite dev server — hot-reload via volume sur /app/src
  nginx      # Reverse proxy — point d'entrée unique sur :8080
```

Le backend exécute automatiquement `drizzle-kit push` + seed au démarrage.

---

## Système de rôles

| Rôle     | Accès projets          | Tâches           | Activités     | Commentaires | Notifications | Agenda       |
| -------- | ---------------------- | ---------------- | ------------- | ------------ | ------------- | ------------ |
| `pro`    | Ses projets            | Créer / modifier | Créer         | Lire         | —             | Créer / modifier |
| `client` | Ses projets uniquement | Lecture seule    | Lecture seule | Écrire       | Lire / marquer lu | Lecture seule |

---

## Variables d'environnement

Les fichiers `.env.example` sont utilisés directement par Docker Compose (aucun `.env` requis).

### Backend (`backend/.env.example`)

| Variable             | Description                     |
| -------------------- | ------------------------------- |
| `DATABASE_URL`       | URL PostgreSQL                  |
| `BETTER_AUTH_SECRET` | Clé secrète pour les sessions   |
| `BETTER_AUTH_URL`    | URL publique du backend         |
| `FRONTEND_URL`       | URL du frontend (CORS)          |
| `PORT`               | Port du serveur (défaut : 3000) |

### Frontend (`frontend/.env.example`)

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `VITE_API_URL` | URL de base de l'API backend |

---

## API (via `/backend`)

### Projets

- `GET /projects` — Liste (filtrée par rôle)
- `GET /projects/:id` — Détail
- `POST /projects` — Créer (pro/admin)
- `PATCH /projects/:id` — Modifier (pro/admin)
- `DELETE /projects/:id` — Supprimer (pro/admin)

### Tâches

- `GET /projects/:id/tasks` — Liste des tâches
- `POST /tasks` — Créer (pro/admin)
- `PATCH /tasks/:id` — Modifier le statut (pro/admin)
- `DELETE /tasks/:id` — Supprimer (pro/admin)

### Activités

- `GET /projects/:id/activities` — Journal
- `POST /activities` — Créer une entrée (pro/admin)

### Commentaires

- `GET /activities/:id/comments` — Liste
- `POST /activities/:id/comments` — Ajouter

### Rendez-vous

- `GET /appointments` — Liste (filtrée par rôle)
- `POST /appointments` — Créer (pro/admin)
- `PATCH /appointments/:id` — Modifier (pro/admin)
- `DELETE /appointments/:id` — Supprimer (pro/admin)

### Notifications

- `GET /notifications` — Liste (client)
- `PATCH /notifications/read-all` — Tout marquer comme lu (client)

### Utilisateurs & Métiers

- `GET /users/:id` — Profil utilisateur
- `GET /trades` — Liste des métiers
- `GET /trades/:id/categories` — Catégories d'un métier

### Pro-Clients

- `GET /pro-clients/my-clients` — Clients liés au pro connecté
- `POST /pro-clients` — Lier un client
- `DELETE /pro-clients/:clientId` — Délier un client
