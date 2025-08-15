import React from 'react';
import { User } from '../../types';
import LearnersBookingsScreen from './LearnersBookingsScreen';
import TeachersBookingsScreen from './TeachersBookingsScreen';

interface BookingsScreenProps {
  user: User;
  onCreateListing?: () => void;
}

export default function BookingsScreen({ user, onCreateListing }: BookingsScreenProps) {
  if (user.isTeacher) {
    return <TeachersBookingsScreen user={user} onCreateListing={onCreateListing} />;
  } else {
    return <LearnersBookingsScreen user={user} />;
  }
}