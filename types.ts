export type UserRole = 'teacher' | 'learner';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
  profilePhoto?: string;
  location?: string;
  skillLevel?: SkillLevel;
  bio?: string;
  profileCompleted?: boolean;
}

export interface ProfileSetupData {
  profilePhoto?: string;
  location: string;
  role: UserRole;
  skillLevel: SkillLevel;
  bio: string;
}

export type ScreenType = 'login' | 'signup' | 'dashboard' | 'forgotPassword' | 'profileSetup';
