export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tradeId: string | null;
  tradeName?: string | null;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tradeId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  clientId: string | null;
  clientName?: string | null;
  proId: string | null;
  proName?: string | null;
  tradeName?: string | null;
  startDate: string | null;
  estimatedEndDate: string | null;
  createdAt: string | null;
  progress: number;
  taskStats: { total: number; done: number };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: string;
  category: string | null;
  createdAt: string | null;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string | null;
  userName: string | null;
  message: string;
  createdAt: string | null;
}

export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  userName: string | null;
  message: string;
  createdAt: string | null;
}

export interface Attachment {
  id: string;
  activityId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  createdAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  projectId: string | null;
  read: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  userId: string;
  clientId: string | null;
  createdAt: string | null;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  name: string;
  createdAt: string | null;
}

export interface TradeCategory {
  id: string;
  tradeId: string;
  name: string;
  createdAt: string | null;
}

export interface UserProfile extends User {
  projects: { id: string; name: string; status: string }[];
}

export interface DeleteResponse {
  deleted: boolean;
}
