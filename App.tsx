import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import { ScreenType, User, UserRole } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleSwitchToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
  };

  const handleLoginSuccess = (email: string) => {
    // In a real app, you would get user data from your backend
    // For now, we'll create a mock user
    const mockUser: User = {
      firstName: 'Demo',
      lastName: 'User',
      email: email,
      role: 'learner', // Default role for login
    };
    setUser(mockUser);
    setCurrentScreen('dashboard');
  };

  const handleSignupSuccess = (firstName: string, lastName: string, email: string, role: UserRole) => {
    // In a real app, you would create the user in your backend
    // For now, we'll create a mock user with the provided data
    const newUser: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role,
    };
    setUser(newUser);
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
      default:
        return (
          <LoginScreen
            onSwitchToSignup={handleSwitchToSignup}
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

