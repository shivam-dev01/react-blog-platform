export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Blog {
  blogId: string;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  data?: any;
}
