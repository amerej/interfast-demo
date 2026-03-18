export const mockUser = {
  id: 'user-1',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  role: 'client',
  createdAt: '2025-01-15T10:00:00.000Z',
};

export const mockAdminUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: '2025-01-01T10:00:00.000Z',
};

export const mockProjects = [
  {
    id: 'proj-1',
    name: 'Rénovation Bureau',
    status: 'in_progress',
    clientId: 'user-1',
    clientName: 'Jean Dupont',
    proId: 'admin-1',
    proName: 'Admin User',
    startDate: '2025-03-01T00:00:00.000Z',
    estimatedEndDate: '2025-09-01T00:00:00.000Z',
    createdAt: '2025-02-15T10:00:00.000Z',
    progress: 65,
    taskStats: { total: 20, done: 13 },
  },
  {
    id: 'proj-2',
    name: 'Construction Entrepôt',
    status: 'planning',
    clientId: 'user-1',
    clientName: 'Jean Dupont',
    proId: 'admin-1',
    proName: 'Admin User',
    startDate: '2025-06-01T00:00:00.000Z',
    estimatedEndDate: '2026-01-01T00:00:00.000Z',
    createdAt: '2025-03-01T10:00:00.000Z',
    progress: 0,
    taskStats: { total: 0, done: 0 },
  },
];

export const mockProject = {
  ...mockProjects[0],
};

export const mockTasks = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Démolition murs porteurs',
    status: 'done',
    category: 'Gros œuvre',
    createdAt: '2025-03-01T10:00:00.000Z',
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Installation électrique',
    status: 'doing',
    category: 'Électricité',
    createdAt: '2025-03-05T10:00:00.000Z',
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Peinture intérieure',
    status: 'todo',
    category: 'Finitions',
    createdAt: '2025-03-10T10:00:00.000Z',
  },
];

export const mockActivities = [
  {
    id: 'act-1',
    projectId: 'proj-1',
    userId: 'admin-1',
    userName: 'Admin User',
    message: 'Projet démarré',
    type: 'milestone',
    createdAt: '2025-03-01T10:00:00.000Z',
  },
  {
    id: 'act-2',
    projectId: 'proj-1',
    userId: 'admin-1',
    userName: 'Admin User',
    message: 'Tâche "Démolition murs porteurs" marquée comme terminée',
    type: 'update',
    createdAt: '2025-03-15T10:00:00.000Z',
  },
];

export const mockComments = [
  {
    id: 'com-1',
    activityId: 'act-1',
    userId: 'user-1',
    userName: 'Jean Dupont',
    message: 'Super avancement !',
    createdAt: '2025-03-02T10:00:00.000Z',
  },
];

export const mockUserWithProjects = {
  ...mockUser,
  projects: mockProjects.map(({ id, name, status }) => ({ id, name, status })),
};
