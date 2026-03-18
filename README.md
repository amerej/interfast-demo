# Interfast Portal

Portail client SaaS pour entreprises du BTP. Permet aux professionnels de gérer leurs projets et à leurs clients de suivre l'avancement en temps réel.

---

## Démarrage rapide

```bash
docker compose up --build
```

Accès : [http://localhost:8080](http://localhost:8080)

### Comptes de démonstration

| Rôle         | Email                    | Mot de passe |
|--------------|--------------------------|--------------|
| Admin        | admin@example.com        | admin123     |
| Client       | client@example.com       | client123    |

---

## Rapport technique

### Vue d'ensemble

Interfast Portal est une application full-stack conteneurisée composée de quatre services Docker orchestrés via Docker Compose :

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

### Stack technique

| Couche        | Technologie                             |
|---------------|-----------------------------------------|
| Base de données | PostgreSQL 15                         |
| ORM           | Drizzle ORM + drizzle-kit               |
| Backend       | NestJS (Node.js + Express)              |
| Authentification | Better Auth (email/password)         |
| Temps réel    | Socket.io (WebSockets)                  |
| Frontend      | React 19 + React Router v7 + Vite       |
| Style         | TailwindCSS v4 + ShadcnUI (Radix UI)    |
| Proxy         | Nginx                                   |
| Conteneurs    | Docker + Docker Compose                 |

---

### Architecture backend

#### Modules NestJS

| Module          | Responsabilité                                               |
|-----------------|--------------------------------------------------------------|
| `auth`          | Délégation à Better Auth (catch-all route)                  |
| `users`         | Profil utilisateur                                           |
| `projects`      | CRUD projets, calcul de progression, émission Socket.io      |
| `tasks`         | Gestion des tâches, mise à jour statut, émission Socket.io   |
| `activities`    | Journal d'activités, **WebSocket gateway** (Socket.io)       |
| `comments`      | Commentaires sur activités, émission Socket.io               |
| `trades`        | Métiers et catégories (électricien, plombier…)               |
| `pro-clients`   | Liens entre professionnels et clients                        |

#### Schéma de base de données

```
trades ─────────────── trade_categories
  │
  └── user (role: admin | client | pro | artisan)
        │
        ├── pro_clients (proId ↔ clientId)
        │
        └── projects (clientId, proId)
              │
              ├── tasks (status: todo | doing | done)
              │
              └── activities (userId)
                    │
                    └── comments (userId)
```

Tables Better Auth gérées automatiquement : `session`, `account`, `verification`.

#### Authentification (Better Auth)

- Transport : cookie de session HTTP
- Stratégie : email + mot de passe
- Champs personnalisés sur `user` : `role`, `tradeId`
- Guard NestJS `AuthGuard` + décorateur `@User()` pour injecter l'utilisateur courant
- Guard `RolesGuard` + décorateur `@Roles()` pour le contrôle d'accès par rôle

#### Temps réel (Socket.io)

Namespace WebSocket : `/ws` — accessible via `/backend/socket.io`.

**Rooms :**
- `project:{projectId}` — suivi d'un projet spécifique
- `client:{clientId}` — notifications globales d'un client

**Événements serveur → client :**

| Événement       | Émis par                      | Room ciblée            |
|-----------------|-------------------------------|------------------------|
| `newActivity`   | `ActivitiesService.create`    | `project:{projectId}`  |
| `newComment`    | `CommentsService.create`      | `project:{projectId}`  |
| `taskUpdate`    | `TasksService.create/update`  | `project:{projectId}`  |
| `projectUpdate` | `ProjectsService.create/update/remove` | `client:{clientId}` |

---

### Architecture frontend

#### Routing

| Route                  | Composant              | Protection | Rôle  |
|------------------------|------------------------|------------|-------|
| `/`                    | RootRedirect           | session    | —     |
| `/auth`                | AuthPage               | —          | —     |
| `/projects`            | ProjectsPage           | ✓          | client|
| `/projects/:id`        | ProjectDashboard       | ✓          | client|
| `/user/:id`            | UserPage               | ✓          | client|
| `/pro/auth`            | ProAuthPage            | —          | —     |
| `/pro/projects`        | ProProjectsPage        | ✓          | pro   |
| `/pro/projects/new`    | ProProjectForm         | ✓          | pro   |
| `/pro/projects/:id`    | ProProjectDashboard    | ✓          | pro   |
| `/pro/clients`         | ProClientsPage         | ✓          | pro   |

Deux layouts distincts : `<Layout>` (client) et `<ProLayout>` (professionnel).

#### Structure des sources

```
frontend/src/
├── App.tsx                   # Routing principal
├── components/
│   ├── Layout.tsx            # Layout client
│   ├── ProLayout.tsx         # Layout pro
│   └── ui/                   # Composants ShadcnUI
├── features/
│   ├── auth/                 # Login client
│   ├── pro/                  # Espace professionnel
│   ├── projects/             # Dashboard client
│   └── users/                # Profil
├── hooks/
│   └── use-theme.ts          # Dark/light mode
└── lib/
    ├── api.ts                # Client HTTP
    ├── auth-client.ts        # Better Auth client
    ├── socket.ts             # Socket.io singleton
    └── project-status.ts     # Labels & couleurs de statut
```

---

### Infrastructure Docker

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

| Rôle      | Accès projets         | Tâches            | Activités         | Commentaires |
|-----------|-----------------------|-------------------|-------------------|--------------|
| `admin`   | Tous les projets      | Créer / modifier  | Créer             | Lire         |
| `pro`     | Ses projets           | Créer / modifier  | Créer             | Lire         |
| `client`  | Ses projets uniquement| Lecture seule     | Lecture seule     | Écrire       |

---

## Variables d'environnement

### Backend (`backend/.env`)

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `DATABASE_URL`     | URL PostgreSQL                       |
| `BETTER_AUTH_SECRET` | Clé secrète pour les sessions      |
| `BETTER_AUTH_URL`  | URL publique du backend              |
| `FRONTEND_URL`     | URL du frontend (CORS)               |
| `PORT`             | Port du serveur (défaut : 3000)      |

### Frontend (`frontend/.env`)

| Variable       | Description                   |
|----------------|-------------------------------|
| `VITE_API_URL` | URL de base de l'API backend  |

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

### Utilisateurs & Métiers
- `GET /users/:id` — Profil utilisateur
- `GET /trades` — Liste des métiers
- `GET /trades/:id/categories` — Catégories d'un métier

### Pro-Clients
- `GET /pro-clients/my-clients` — Clients liés au pro connecté
- `POST /pro-clients` — Lier un client
- `DELETE /pro-clients/:clientId` — Délier un client
