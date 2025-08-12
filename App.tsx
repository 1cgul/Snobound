import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { NavigationContainer } from '@react-navigation/native';

// Initialize Firebase
import './config/firebase';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import SelectListingTypeScreen from './screens/SelectListingTypeScreen';
import MainTabNavigator from './components/MainTabNavigator';
import { ScreenType, User } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<User | null>(null);

  // Helper function to check if profile is complete
  const isProfileComplete = (user: User): boolean => {
    return !!(user.isTeacher !== undefined || user.location || user.bio);
  };

  const handleSwitchToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
  };

  const handleSwitchToForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const handleLoginSuccess = (userData: User | null) => {
    if (userData) {
      setUser(userData);
      setCurrentScreen('dashboard');
    } else {
      Alert.alert('Error', 'User data not found');
    }
  };

  const handleSignupSuccess = async (firstName: string, lastName: string, email: string) => {
    // User has been created in Firebase, now create local user object
    const newUser: User = {
      firstName: firstName,
      lastName: lastName,
      email: email,
    };
    setUser(newUser);
    // Take new users directly to signup
    setCurrentScreen('profileSetup');
  };

  const handleProfileComplete = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentScreen('dashboard');
  };

  const handleSkipProfileSetup = () => {
    setCurrentScreen('dashboard');
  };

  const handleEditProfile = () => {
    setCurrentScreen('profileSetup');
  };

  const handleCreateListing = () => {
    setCurrentScreen('selectListingType');
  };

  const handleSelectSingleListing = () => {
    setCurrentScreen('createListing');
  };

  const handleSelectRecurringListing = () => {
    // TODO: Create recurring listing screen
    setCurrentScreen('createListing'); // For now, use same screen
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleBackToSelectType = () => {
    setCurrentScreen('selectListingType');
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setCurrentScreen('login');
      })
      .catch((error) => {
        console.error('Sign out error:', error);
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      });
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
          <NavigationContainer>
            <MainTabNavigator
              user={user}
              onLogout={handleLogout}
              onEditProfile={handleEditProfile}
            />
          </NavigationContainer>
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

