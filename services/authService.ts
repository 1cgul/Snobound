import { User, UserRole } from '../types';

// Mock API responses for development
// Replace these with actual API calls when you implement the backend

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Mock implementation - replace with actual API calls
export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    return {
      success: true,
      user: {
        firstName: 'Demo',
        lastName: 'User',
        email: request.email,
        role: 'learner', // Default role for existing users
      },
      token: 'mock-jwt-token',
    };
  },

  signup: async (request: SignupRequest): Promise<SignupResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful signup
    return {
      success: true,
      user: {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        role: request.role,
      },
      token: 'mock-jwt-token',
    };
  },

  logout: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Clear any stored tokens, session data, etc.
  },
};

// Future: Add more service methods like:
// - refreshToken()
// - forgotPassword()
// - resetPassword()
// - updateProfile()
// - deleteAccount()
