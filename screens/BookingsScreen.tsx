import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';

interface BookingsScreenProps {
  user: User;
  onCreateListing?: () => void;
}

export default function BookingsScreen({ user, onCreateListing }: BookingsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        {user.isTeacher && onCreateListing && (
          <TouchableOpacity style={styles.addButton} onPress={onCreateListing}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.content}>
        
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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