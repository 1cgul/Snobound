import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';

import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SelectListingTypeScreen from '../screens/SelectListingTypeScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import RecurringListingScreen from '../screens/RecurringListingScreen';

const Tab = createBottomTabNavigator();

interface MainTabNavigatorProps {
  user: User;
  onLogout: () => void;
  onEditProfile: () => void;
}

export default function MainTabNavigator({ user, onLogout, onEditProfile }: MainTabNavigatorProps) {
  const [currentView, setCurrentView] = useState<'tabs' | 'selectType' | 'createListing' | 'recurringListing'>('tabs');
  const [initialTab, setInitialTab] = useState<string>('Bookings');

  const handleCreateListing = () => setCurrentView('selectType');
  const handleSelectSingle = () => setCurrentView('createListing');
  const handleSelectRecurring = () => setCurrentView('recurringListing');
  const handleBackToBookings = () => {
    setInitialTab('Bookings');
    setCurrentView('tabs');
  };
  const handleBackToSelectType = () => setCurrentView('selectType');
  const handleListingSuccess = () => {
    setInitialTab('Bookings');
    setCurrentView('tabs');
  };

  if (currentView === 'selectType') {
    return (
      <SelectListingTypeScreen
        onBack={handleBackToBookings}
        onSelectSingle={handleSelectSingle}
        onSelectRecurring={handleSelectRecurring}
      />
    );
  }

  if (currentView === 'createListing') {
    return (
      <CreateListingScreen
        user={user}
        onBack={handleBackToSelectType}
        onSuccess={handleListingSuccess}
      />
    );
  }

  if (currentView === 'recurringListing') {
    return (
      <RecurringListingScreen
        user={user}
        onBack={handleBackToSelectType}
        onSuccess={handleListingSuccess}
      />
    );
  }
  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ title: 'Home' }}
      >
        {() => <HomeScreen user={user} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Bookings" 
        options={{ title: 'Bookings' }}
      >
        {() => <BookingsScreen user={user} onCreateListing={handleCreateListing} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Messages" 
        options={{ title: 'Messages' }}
      >
        {() => <MessagesScreen user={user} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Profile" 
        options={{ title: 'Profile' }}
      >
        {() => <ProfileScreen user={user} onLogout={onLogout} onEditProfile={onEditProfile} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}