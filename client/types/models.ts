import { AuthTokens } from "./api";

export interface User {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  statusId: string;
  projectId: string;
  assignees: User[];
  createdAt: string;
  updatedAt: string;
}
