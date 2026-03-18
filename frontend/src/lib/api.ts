const API_URL = import.meta.env.VITE_API_URL || '/backend';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface Project {
  id: string;
  name: string;
  status: string;
  clientId: string;
  startDate: string | null;
  estimatedEndDate: string | null;
  progress: number;
  taskStats: { total: number; done: number };
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: string;
  category: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export const api = {
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),

  getProjectTasks: (projectId: string) => request<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (data: { projectId: string; title: string; status?: string; category?: string }) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: { title?: string; status?: string; category?: string }) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<{ deleted: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  getProjectActivities: (projectId: string) =>
    request<Activity[]>(`/projects/${projectId}/activities`),
  createActivity: (data: { projectId: string; message: string }) =>
    request<Activity>('/activities', { method: 'POST', body: JSON.stringify(data) }),

  getActivityComments: (activityId: string) =>
    request<Comment[]>(`/activities/${activityId}/comments`),
  createComment: (activityId: string, message: string) =>
    request<Comment>(`/activities/${activityId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getUser: (id: string) => request<{ id: string; name: string; email: string; role: string }>(`/users/${id}`),
};
