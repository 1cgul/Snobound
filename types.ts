export type ScreenType = 'login' | 'signup' | 'dashboard' | 'forgotPassword' | 'profileSetup' | 'createListing' | 'selectListingType';

export type TabScreenType = 'Home' | 'Bookings' | 'Messages' | 'Profile';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  isTeacher?: boolean;
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
  isTeacher: boolean;
  skillLevel: SkillLevel;
  bio: string;
}

export type SportSkill = 'snowboarding' | 'skiing';

export interface Listing {
  id?: string;
  teacherId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location: string;
  price: number;
  skill: SportSkill;
  createdAt: Date;
}