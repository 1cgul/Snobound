import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { User, SportSkill } from '../types';
import ListingService from '../services/listingService';

interface CreateListingScreenProps {
  user: User;
  onBack: () => void;
  onSuccess?: () => void;
}

export default function CreateListingScreen({ user, onBack, onSuccess }: CreateListingScreenProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('5:00 PM');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [skill, setSkill] = useState<SportSkill>('snowboarding');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Generate time options in 12-hour format with AM/PM (EST)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      times.push(`${displayHour}:00 ${ampm}`);
      times.push(`${displayHour}:30 ${ampm}`);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Convert 12-hour format to 24-hour format for storage
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleCreateListing = async () => {
    // Basic validation
    if (!date || !startTime || !endTime || !location || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      await ListingService.createListing({
        teacherId: user.uid || user.id || user.email,
        date,
        startTime: convertTo24Hour(startTime),
        endTime: convertTo24Hour(endTime),
        location,
        price: priceNumber,
        skill,
      });

      Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: onSuccess || onBack }
      ]);
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Listing</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day: any) => setDate(day.dateString)}
                markedDates={{
                  [date]: { selected: true, selectedColor: '#007AFF' }
                }}
                theme={{
                  selectedDayBackgroundColor: '#007AFF',
                  todayTextColor: '#007AFF',
                  arrowColor: '#007AFF',
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>{startTime}</Text>
              <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>{endTime}</Text>
              <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Vail Mountain, Colorado"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price per Hour ($)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="e.g., 75"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sport</Text>
            <View style={styles.skillContainer}>
              <TouchableOpacity
                style={[
                  styles.skillButton,
                  skill === 'snowboarding' && styles.skillButtonSelected
                ]}
                onPress={() => setSkill('snowboarding')}
              >
                <Text style={[
                  styles.skillButtonText,
                  skill === 'snowboarding' && styles.skillButtonTextSelected
                ]}>
                  🏂 Snowboarding
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.skillButton,
                  skill === 'skiing' && styles.skillButtonSelected
                ]}
                onPress={() => setSkill('skiing')}
              >
                <Text style={[
                  styles.skillButtonText,
                  skill === 'skiing' && styles.skillButtonTextSelected
                ]}>
                  🎿 Skiing
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateListing}>
            <Text style={styles.createButtonText}>Create Listing</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Start Time Picker Modal */}
        <Modal visible={showStartTimePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Start Time</Text>
                <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={startTime}
                onValueChange={setStartTime}
                style={styles.modalPicker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* End Time Picker Modal */}
        <Modal visible={showEndTimePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>End Time</Text>
                <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={endTime}
                onValueChange={setEndTime}
                style={styles.modalPicker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
    paddingTop: 15,
    paddingBottom: 25,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    fontSize: 16,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  timeButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalPicker: {
    height: 200,
  },
  skillContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  skillButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  skillButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  skillButtonText: {
    fontSize: 16,
    color: '#666',
  },
  skillButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});