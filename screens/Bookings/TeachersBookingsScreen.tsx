import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { User, Listing, RecurringListing } from '../../types';
import ListingService from '../../services/listingService';
import { formatTime, generateRecurringDates, formatDateForDisplay } from '../../utils/bookingUtils';

interface TeachersBookingsScreenProps {
  user: User;
  onCreateListing?: () => void;
}

export default function TeachersBookingsScreen({ user, onCreateListing }: TeachersBookingsScreenProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [recurringListings, setRecurringListings] = useState<RecurringListing[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayListings, setDayListings] = useState<Listing[]>([]);
  const [dayExclusions, setDayExclusions] = useState<{date: string, recurringListingId: string}[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    if (user.uid || user.id || user.email) {
      loadListings();
    }
  }, [user]);



  const loadListings = async () => {
    try {
      const teacherId = user.uid || user.id || user.email;
      
      const [singleListings, recurringListings, allExclusions] = await Promise.all([
        ListingService.getTeacherListings(teacherId),
        ListingService.getTeacherRecurringListings(teacherId),
        ListingService.getAllTeacherExclusions(teacherId)
      ]);
      
      setListings(singleListings);
      setRecurringListings(recurringListings);
      
      const generatedFromRecurring = await generateRecurringDates(recurringListings);
      const allListings = [...singleListings, ...generatedFromRecurring];
      
      const marked: any = {};
      allListings.forEach(listing => {
        marked[listing.date] = {
          marked: true,
          dotColor: '#007AFF',
          selectedColor: '#007AFF'
        };
      });
      
      // Mark exclusions with red dots
      allExclusions.forEach(exclusion => {
        marked[exclusion.date] = {
          ...marked[exclusion.date],
          marked: true,
          dotColor: '#ff4444'
        };
      });
      
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };



  const handleDayPress = async (day: any) => {
    const dateString = day.dateString;
    
    const singleDayListings = listings.filter(listing => listing.date === dateString);
    const recurringDayListings = (await generateRecurringDates(recurringListings)).filter(listing => listing.date === dateString);
    const allDayListings = [...singleDayListings, ...recurringDayListings];
    const exclusions = (await ListingService.getAllTeacherExclusions(user.uid || user.id || user.email)).filter(ex => ex.date === dateString);
    
    if (allDayListings.length > 0 || exclusions.length > 0) {
      setSelectedDate(dateString);
      setDayListings(allDayListings);
      setDayExclusions(exclusions);
      setShowDayModal(true);
    }
  };

  const deleteListing = async (listing: Listing) => {
    if (listing.id?.includes('-')) {
      // Recurring listing
      Alert.alert(
        'Delete Availability',
        'How would you like to remove this availability?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Just This Date',
            onPress: async () => {
              try {
                const recurringId = listing.id!.split('-')[0];
                await ListingService.addExclusion(recurringId, listing.date);
                loadListings();
                setShowDayModal(false);
              } catch (error) {
                Alert.alert('Error', 'Failed to exclude date');
              }
            }
          },
          {
            text: 'All Future',
            style: 'destructive',
            onPress: async () => {
              try {
                const recurringId = listing.id!.split('-')[0];
                await ListingService.deleteRecurringListing(recurringId);
                loadListings();
                setShowDayModal(false);
              } catch (error) {
                Alert.alert('Error', 'Failed to delete recurring listing');
              }
            }
          }
        ]
      );
    } else {
      // Single listing
      Alert.alert(
        'Delete Listing',
        'Are you sure you want to delete this availability?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await ListingService.deleteListing(listing.id!);
                loadListings();
                setShowDayModal(false);
              } catch (error) {
                Alert.alert('Error', 'Failed to delete listing');
              }
            }
          }
        ]
      );
    }
  };

  const renderTimeSlot = ({ item }: { item: Listing }) => (
    <TouchableOpacity 
      style={styles.timeSlot}
      onLongPress={() => deleteListing(item)}
    >
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
        <Text style={styles.deleteHint}>Hold to delete</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Availability</Text>
        {onCreateListing && (
          <TouchableOpacity style={styles.filterButton} onPress={onCreateListing}>
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
                {selectedDate ? formatDateForDisplay(selectedDate) : ''}
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
            
            {dayExclusions.length > 0 && (
              <View style={styles.exclusionsSection}>
                <Text style={styles.exclusionsTitle}>Excluded Times</Text>
                {dayExclusions.map((exclusion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exclusionItem}
                    onLongPress={() => {
                      Alert.alert(
                        'Remove Exclusion',
                        'Restore availability for this date?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Restore',
                            onPress: async () => {
                              try {
                                await ListingService.removeExclusion(exclusion.recurringListingId, exclusion.date);
                                loadListings();
                                setShowDayModal(false);
                              } catch (error) {
                                Alert.alert('Error', 'Failed to restore availability');
                              }
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.exclusionText}>🚫 Availability excluded</Text>
                    <Text style={styles.exclusionHint}>Hold to restore</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  filterButton: {
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
    height: '85%',
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
  deleteHint: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  exclusionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exclusionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
  },
  exclusionItem: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  exclusionText: {
    fontSize: 14,
    color: '#cc0000',
    fontWeight: '500',
  },
  exclusionHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
});