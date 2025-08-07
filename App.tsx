import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import { ScreenType, User } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleSwitchToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
  };

  const handleSwitchToForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const handleLoginSuccess = (email: string) => {
    // In a real app, you would get user data from your backend
    // For now, we'll create a mock user
    const mockUser: User = {
      firstName: 'Demo',
      lastName: 'User',
      email: email,
      role: 'learner', // Default role for login
      profileCompleted: true, // Assume existing users have completed profile
    };
    setUser(mockUser);
    setCurrentScreen('dashboard');
  };

  const handleSignupSuccess = (firstName: string, lastName: string, email: string) => {
    // In a real app, you would create the user in your backend
    // For now, we'll create a mock user with the provided data
    const newUser: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      profileCompleted: false,
    };
    setUser(newUser);
    setCurrentScreen('profileSetup');
  };

  const handleProfileComplete = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentScreen('dashboard');
  };

  const handleSkipProfileSetup = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onSwitchToLogin={handleSwitchToLogin}
            onSignupSuccess={handleSignupSuccess}
          />
        );
      case 'dashboard':
        return user ? (
          <DashboardScreen
            user={user}
            onLogout={handleLogout}
          />
        ) : null;
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'profileSetup':
        return user ? (
          <ProfileSetupScreen
            user={user}
            onProfileComplete={handleProfileComplete}
            onSkipForNow={handleSkipProfileSetup}
          />
        ) : null;
      default:
        return (
          <LoginScreen
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {renderCurrentScreen()}
    </SafeAreaProvider>
  );
}

