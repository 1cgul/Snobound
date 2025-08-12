import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../types';

interface MessagesScreenProps {
  user: User;
}

export default function MessagesScreen({ user }: MessagesScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Messages</Text>
        
        <View style={styles.card}>
          <Text style={styles.emoji}>💬</Text>
          <Text style={styles.cardTitle}>Chat & Communication</Text>
          <Text style={styles.cardDescription}>
            {user.isTeacher 
              ? 'Connect with your students, answer questions, and provide guidance.'
              : 'Chat with your instructors, ask questions, and get personalized advice.'
            }
          </Text>
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Coming Soon:</Text>
          <Text style={styles.comingSoonText}>
            • Real-time messaging{'\n'}
            • Group chats{'\n'}
            • Share photos and videos{'\n'}
            • Voice messages{'\n'}
            • Message history
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