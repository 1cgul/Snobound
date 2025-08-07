export type UserRole = 'teacher' | 'learner';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export type ScreenType = 'login' | 'signup' | 'dashboard' | 'forgotPassword';
