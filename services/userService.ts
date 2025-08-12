import { User } from '../types';

// Mock data and functions for user management
// Replace with actual API calls when implementing backend

export interface UserProfile extends User {
  bio?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredMountains?: string[];
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
}

// Mock implementation - replace with actual API calls
export const userService = {
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock user profile
    return {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@snobound.com',
      isTeacher: true,
      bio: 'Passionate snowboarder with 10+ years of experience teaching beginners.',
      experienceLevel: 'expert',
      preferredMountains: ['Whistler', 'Vail', 'Park City'],
      certifications: ['PSIA Level 3', 'Avalanche Safety'],
      rating: 4.8,
      reviewCount: 127,
    };
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return updated mock profile
    return {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@snobound.com',
      isTeacher: true,
      ...updates,
    };
  },

  searchUsers: async (filters: {
    role?: 'teacher' | 'learner';
    location?: string;
    experienceLevel?: string;
  }): Promise<UserProfile[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return mock search results
    return [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        isTeacher: true,
        experienceLevel: 'expert',
        rating: 4.9,
        reviewCount: 203,
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@example.com',
        isTeacher: true,
        experienceLevel: 'advanced',
        rating: 4.7,
        reviewCount: 89,
      },
    ];
  },
};

// Future: Add more service methods like:
// - getUsersByLocation()
// - getUserReviews()
// - reportUser()
// - blockUser()
// - getFavoriteUsers()
