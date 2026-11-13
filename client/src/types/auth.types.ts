export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
