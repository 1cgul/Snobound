import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../types';

interface BookingsScreenProps {
  user: User;
}

export default function BookingsScreen({ user }: BookingsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Bookings</Text>
        
        <View style={styles.card}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.cardTitle}>Your Lessons & Sessions</Text>
          <Text style={styles.cardDescription}>
            {user.isTeacher 
              ? 'Manage your teaching schedule and upcoming lessons with students.'
              : 'View your booked lessons and upcoming sessions with instructors.'
            }
          </Text>
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Coming Soon:</Text>
          <Text style={styles.comingSoonText}>
            • View upcoming bookings{'\n'}
            • Schedule new lessons{'\n'}
            • Manage availability{'\n'}
            • Cancel or reschedule{'\n'}
            • View booking history
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoon: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});