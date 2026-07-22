export interface BaseComponentProps {
  children?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
