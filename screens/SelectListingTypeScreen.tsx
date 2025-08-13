import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SelectListingTypeScreenProps {
  onBack: () => void;
  onSelectSingle: () => void;
  onSelectRecurring: () => void;
}

export default function SelectListingTypeScreen({ 
  onBack, 
  onSelectSingle, 
  onSelectRecurring 
}: SelectListingTypeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Listing</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Choose listing type</Text>
        
        <TouchableOpacity style={styles.optionCard} onPress={onSelectSingle}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionEmoji}>📅</Text>
            <Text style={styles.optionTitle}>Single Listing</Text>
          </View>
          <Text style={styles.optionDescription}>
            Create availability for a specific date and time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={onSelectRecurring}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionEmoji}>🔄</Text>
            <Text style={styles.optionTitle}>Recurring Listing</Text>
          </View>
          <Text style={styles.optionDescription}>
            Set up repeating availability (weekly schedule)
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    fontSize: 28,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
});