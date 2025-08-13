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
import { Picker } from '@react-native-picker/picker';
import { User, SportSkill } from '../types';
import ListingService from '../services/listingService';

interface RecurringListingScreenProps {
  user: User;
  onBack: () => void;
  onSuccess?: () => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sunday', short: 'Sun', value: 0 },
  { label: 'Monday', short: 'Mon', value: 1 },
  { label: 'Tuesday', short: 'Tue', value: 2 },
  { label: 'Wednesday', short: 'Wed', value: 3 },
  { label: 'Thursday', short: 'Thu', value: 4 },
  { label: 'Friday', short: 'Fri', value: 5 },
  { label: 'Saturday', short: 'Sat', value: 6 },
];

interface RecurringAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  skill: SportSkill;
}

export default function RecurringListingScreen({ user, onBack, onSuccess }: RecurringListingScreenProps) {
  const [availabilities, setAvailabilities] = useState<RecurringAvailability[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('5:00 PM');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [skill, setSkill] = useState<SportSkill>('snowboarding');
  const [duration, setDuration] = useState(3); // months
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

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

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasTimeConflict = (newStart: string, newEnd: string, existingStart: string, existingEnd: string): boolean => {
    const newStartMin = timeToMinutes(newStart);
    const newEndMin = timeToMinutes(newEnd);
    const existingStartMin = timeToMinutes(existingStart);
    const existingEndMin = timeToMinutes(existingEnd);
    
    return newStartMin < existingEndMin && newEndMin > existingStartMin;
  };

  const addAvailability = () => {
    if (!startTime || !endTime || !location || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const newStartTime = convertTo24Hour(startTime);
    const newEndTime = convertTo24Hour(endTime);

    // Check for time conflicts on the same day with same sport only
    const sameDaySameSkill = availabilities.filter(avail => 
      avail.dayOfWeek === selectedDay && avail.skill === skill
    );
    const hasConflict = sameDaySameSkill.some(avail => 
      hasTimeConflict(newStartTime, newEndTime, avail.startTime, avail.endTime)
    );

    if (hasConflict) {
      Alert.alert('Error', `This time conflicts with an existing ${skill} availability on this day`);
      return;
    }

    const newAvailability: RecurringAvailability = {
      dayOfWeek: selectedDay,
      startTime: newStartTime,
      endTime: newEndTime,
      skill,
    };

    setAvailabilities(prev => [...prev, newAvailability]);
    
    // Keep times and skill persistent - only reset if user wants to
  };

  const removeAvailability = (index: number) => {
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
  };

  const formatTimeDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSaveAllAvailabilities = async () => {
    if (availabilities.length === 0) {
      Alert.alert('Error', 'Please add at least one availability');
      return;
    }

    if (!location || !price) {
      Alert.alert('Error', 'Please fill in location and price');
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);
      
      const promises = availabilities.map(availability =>
        ListingService.createRecurringListing({
          teacherId: user.uid || user.id || user.email,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime,
          startDate,
          endDate,
          location,
          price: priceNumber,
          skill: availability.skill,
        })
      );

      await Promise.all(promises);

      Alert.alert('Success', 'Recurring availability created successfully!', [
        { text: 'OK', onPress: onSuccess || onBack }
      ]);
    } catch (error) {
      console.error('Error creating recurring listing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create recurring listing';
      Alert.alert('Error', errorMessage);
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
          <Text style={styles.title}>Recurring Availability</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Day of Week</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayButton,
                    selectedDay === day.value && styles.dayButtonSelected
                  ]}
                  onPress={() => setSelectedDay(day.value)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDay === day.value && styles.dayButtonTextSelected
                  ]}>
                    {day.short}
                  </Text>
                </TouchableOpacity>
              ))}
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duration</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowDurationPicker(true)}
            >
              <Text style={styles.timeButtonText}>{duration} month{duration !== 1 ? 's' : ''}</Text>
              <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addAvailability}>
            <Text style={styles.addButtonText}>Add to List</Text>
          </TouchableOpacity>

          {/* Current Availabilities List */}
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Added Availabilities</Text>
            {availabilities.length > 0 ? (
              availabilities
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                .map((availability, index) => {
                  const dayName = DAYS_OF_WEEK.find(d => d.value === availability.dayOfWeek)?.label;
                  return (
                    <View key={index} style={styles.availabilityItem}>
                      <View style={styles.availabilityInfo}>
                        <Text style={styles.availabilityDay}>{dayName}</Text>
                        <Text style={styles.availabilityTime}>
                          {formatTimeDisplay(availability.startTime)} - {formatTimeDisplay(availability.endTime)}
                        </Text>
                        <Text style={styles.availabilityDetails}>
                          {availability.skill === 'snowboarding' ? '🏂' : '🎿'} {availability.skill}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeAvailability(availabilities.indexOf(availability))}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
            ) : (
              <Text style={styles.emptyText}>No availabilities added yet</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, availabilities.length === 0 && styles.saveButtonDisabled]} 
            onPress={handleSaveAllAvailabilities}
            disabled={availabilities.length === 0}
          >
            <Text style={[styles.saveButtonText, availabilities.length === 0 && styles.saveButtonTextDisabled]}>Save All Availabilities</Text>
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

        {/* Duration Picker Modal */}
        <Modal visible={showDurationPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Duration</Text>
                <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
                style={styles.modalPicker}
              >
                <Picker.Item label="1 month" value="1" />
                <Picker.Item label="2 months" value="2" />
                <Picker.Item label="3 months" value="3" />
                <Picker.Item label="4 months" value="4" />
                <Picker.Item label="5 months" value="5" />
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: 'white',
    fontWeight: '700',
  },

  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    marginTop: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  availabilityItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  availabilityTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  availabilityDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: 'bold',
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
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
});