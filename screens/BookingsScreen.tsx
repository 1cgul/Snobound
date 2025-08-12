import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { User, Listing, RecurringListing } from '../types';
import ListingService from '../services/listingService';

interface BookingsScreenProps {
  user: User;
  onCreateListing?: () => void;
}

export default function BookingsScreen({ user, onCreateListing }: BookingsScreenProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [recurringListings, setRecurringListings] = useState<RecurringListing[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayListings, setDayListings] = useState<Listing[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    if (user.isTeacher && (user.uid || user.id || user.email)) {
      loadListings();
    }
  }, [user]);

  const generateRecurringDates = (recurring: RecurringListing[]): Listing[] => {
    const generated: Listing[] = [];
    const today = new Date();
    
    recurring.forEach(recur => {
      let current = new Date(Math.max(recur.startDate.getTime(), today.getTime()));
      const end = recur.endDate;
      
      while (current <= end) {
        if (current.getDay() === recur.dayOfWeek) {
          generated.push({
            id: `${recur.id}-${current.toISOString().split('T')[0]}`,
            teacherId: recur.teacherId,
            date: current.toISOString().split('T')[0],
            startTime: recur.startTime,
            endTime: recur.endTime,
            location: recur.location,
            price: recur.price,
            skill: recur.skill,
            createdAt: recur.createdAt,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    });
    
    return generated;
  };

  const loadListings = async () => {
    try {
      const teacherId = user.uid || user.id || user.email;
      
      const [singleListings, recurringListings] = await Promise.all([
        ListingService.getTeacherListings(teacherId),
        ListingService.getTeacherRecurringListings(teacherId)
      ]);
      
      setListings(singleListings);
      setRecurringListings(recurringListings);
      
      const generatedFromRecurring = generateRecurringDates(recurringListings);
      const allListings = [...singleListings, ...generatedFromRecurring];
      
      const marked: any = {};
      allListings.forEach(listing => {
        marked[listing.date] = {
          marked: true,
          dotColor: '#007AFF',
          selectedColor: '#007AFF'
        };
      });
      
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDayPress = (day: any) => {
    const dateString = day.dateString;
    const singleDayListings = listings.filter(listing => listing.date === dateString);
    const recurringDayListings = generateRecurringDates(recurringListings).filter(listing => listing.date === dateString);
    const allDayListings = [...singleDayListings, ...recurringDayListings];
    
    if (allDayListings.length > 0) {
      setSelectedDate(dateString);
      setDayListings(allDayListings);
      setShowDayModal(true);
    }
  };

  const renderTimeSlot = ({ item }: { item: Listing }) => (
    <View style={styles.timeSlot}>
      <View style={styles.timeInfo}>
        <Text style={styles.timeText}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        <Text style={styles.skillText}>
          {item.skill === 'snowboarding' ? '🏂' : '🎿'} {item.skill}
        </Text>
      </View>
      <View style={styles.priceLocationInfo}>
        <Text style={styles.priceText}>${item.price}/hr</Text>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
    </View>
  );

  if (!user.isTeacher) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.cardTitle}>Your Lessons & Sessions</Text>
            <Text style={styles.cardDescription}>
              View your booked lessons and upcoming sessions with instructors.
            </Text>
          </View>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonTitle}>Coming Soon:</Text>
            <Text style={styles.comingSoonText}>
              • View upcoming bookings{'\n'}
              • Book new lessons{'\n'}
              • Cancel or reschedule{'\n'}
              • View booking history
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Availability</Text>
        {onCreateListing && (
          <TouchableOpacity style={styles.addButton} onPress={onCreateListing}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
              dotColor: '#007AFF',
              textDayFontWeight: '500',
            }}
          />
        </View>
        
        <Text style={styles.instructions}>
          Tap on highlighted dates to view your availability for that day
        </Text>
      </ScrollView>

      <Modal visible={showDayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDayModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : ''}
              </Text>
              <View style={{ width: 24 }} />
            </View>
            
            <FlatList
              data={dayListings}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item.id || ''}
              style={styles.timeSlotsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
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
    maxHeight: '70%',
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
    flex: 1,
    textAlign: 'center',
  },
  timeSlotsList: {
    padding: 20,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  skillText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  priceLocationInfo: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    maxWidth: 120,
    textAlign: 'right',
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