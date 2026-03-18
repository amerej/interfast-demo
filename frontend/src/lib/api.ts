import type {
  Project,
  Task,
  Activity,
  Comment,
  Attachment,
  Appointment,
  Notification,
  UserProfile,
  Client,
  Trade,
  TradeCategory,
  DeleteResponse,
} from './types';

const API_URL = import.meta.env.VITE_API_URL || '/backend';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: isFormData
      ? { ...options?.headers }
      : { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: { name: string; clientId: string; status?: string; startDate?: string; estimatedEndDate?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: { name?: string; status?: string; startDate?: string; estimatedEndDate?: string }) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request<DeleteResponse>(`/projects/${id}`, { method: 'DELETE' }),

  getProjectTasks: (projectId: string) => request<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (data: { projectId: string; title: string; status?: string; category?: string }) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: { title?: string; status?: string; category?: string }) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<DeleteResponse>(`/tasks/${id}`, { method: 'DELETE' }),

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

  getUser: (id: string) => request<UserProfile>(`/users/${id}`),
  updateUser: (id: string, data: { tradeId?: string }) =>
    request<UserProfile>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTrades: () => request<Trade[]>('/trades'),
  getTradeCategories: (tradeId: string) => request<TradeCategory[]>(`/trades/${tradeId}/categories`),

  getProClients: () => request<Client[]>('/pro/clients'),
  createClient: (data: { name: string; email: string }) =>
    request<Client>('/pro/clients', { method: 'POST', body: JSON.stringify(data) }),
  deleteClient: (clientId: string) =>
    request<DeleteResponse>(`/pro/clients/${clientId}`, { method: 'DELETE' }),

  getActivityAttachments: (activityId: string) =>
    request<Attachment[]>(`/activities/${activityId}/attachments`),
  uploadAttachments: (activityId: string, files: FileList) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    return request<Attachment[]>(`/activities/${activityId}/attachments`, { method: 'POST', body: form });
  },
  deleteAttachment: (id: string) => request<DeleteResponse>(`/attachments/${id}`, { method: 'DELETE' }),

  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request<{ updated: number }>('/notifications/read-all', { method: 'PATCH' }),

  getAppointments: () => request<Appointment[]>('/appointments'),
  createAppointment: (data: { title: string; description?: string; startDate: string; endDate: string; allDay?: boolean; clientId: string }) =>
    request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: { title?: string; description?: string; startDate?: string; endDate?: string; allDay?: boolean }) =>
    request<Appointment>(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAppointment: (id: string) =>
    request<DeleteResponse>(`/appointments/${id}`, { method: 'DELETE' }),
};
