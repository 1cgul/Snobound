export type ScreenType = 'login' | 'signup' | 'dashboard' | 'forgotPassword' | 'profileSetup';

export type UserRole = 'learner' | 'teacher' | 'instructor' | 'admin';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
  // Profile fields
  profilePhoto?: string;
  location?: string;
  skillLevel?: SkillLevel;
  bio?: string;
  // Firebase specific fields
  uid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileSetupData {
  profilePhoto?: string;
  location: string;
  role: UserRole;
  skillLevel: SkillLevel;
  bio: string;
}