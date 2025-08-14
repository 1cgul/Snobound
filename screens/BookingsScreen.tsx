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
  TextInput,
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
  const [allAvailableListings, setAllAvailableListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayListings, setDayListings] = useState<Listing[]>([]);
  const [dayExclusions, setDayExclusions] = useState<{date: string, recurringListingId: string}[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterSkill, setFilterSkill] = useState<string>('');
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const [filterStartTime, setFilterStartTime] = useState<string>('');
  const [filterEndTime, setFilterEndTime] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>('');
  const [appliedStartTime, setAppliedStartTime] = useState<string>('');
  const [appliedEndTime, setAppliedEndTime] = useState<string>('');
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [currentFilterType, setCurrentFilterType] = useState<'date' | 'skill' | 'price' | 'time' | ''>('date');

  useEffect(() => {
    if (user.uid || user.id || user.email) {
      loadListings();
    }
  }, [user]);

  useEffect(() => {
    applyAllFilters();
  }, [allAvailableListings, filterStartDate, filterEndDate, filterSkill, appliedMinPrice, appliedMaxPrice, appliedStartTime, appliedEndTime]);

  const generateRecurringDates = async (recurring: RecurringListing[]): Promise<Listing[]> => {
    const generated: Listing[] = [];
    const today = new Date();
    
    for (const recur of recurring) {
      const exclusions = await ListingService.getExclusions(recur.id!);
      let current = new Date(Math.max(recur.startDate.getTime(), today.getTime()));
      const end = recur.endDate;
      
      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];
        if (current.getDay() === recur.dayOfWeek && !exclusions.includes(dateString)) {
          generated.push({
            id: `${recur.id}-${dateString}`,
            teacherId: recur.teacherId,
            date: dateString,
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
    }
    
    return generated;
  };

  const loadListings = async () => {
    try {
      if (user.isTeacher) {
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
      } else {
        // For learners, show all available listings from all teachers
        const [allSingleListings, allRecurringListings] = await Promise.all([
          ListingService.getAllAvailableListings(),
          ListingService.getAllRecurringListings()
        ]);
        
        const generatedFromRecurring = await generateRecurringDates(allRecurringListings);
        const combinedListings = [...allSingleListings, ...generatedFromRecurring];
        
        setAllAvailableListings(combinedListings);
        setFilteredListings(combinedListings);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const formatTime = (time: string) => {
    if (!time || typeof time !== 'string') return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleFilterDayPress = (day: any) => {
    if (isSelectingStart) {
      setFilterStartDate(day.dateString);
      setIsSelectingStart(false);
    } else {
      setFilterEndDate(day.dateString);
      applyFilter(filterStartDate, day.dateString);
      setCurrentFilterType('date');
      setIsSelectingStart(true);
    }
  };

  const applyAllFilters = () => {
    let filtered = [...allAvailableListings];
    
    if (filterStartDate && filterEndDate) {
      filtered = filtered.filter(listing => listing.date >= filterStartDate && listing.date <= filterEndDate);
    }
    if (filterSkill) {
      filtered = filtered.filter(listing => listing.skill === filterSkill);
    }
    if (appliedMinPrice) {
      filtered = filtered.filter(listing => listing.price >= parseFloat(appliedMinPrice));
    }
    if (appliedMaxPrice) {
      filtered = filtered.filter(listing => listing.price <= parseFloat(appliedMaxPrice));
    }
    if (appliedStartTime && appliedEndTime) {
      filtered = filtered.filter(listing => listing.startTime >= appliedStartTime && listing.endTime <= appliedEndTime);
    }
    
    setFilteredListings(filtered);
  };

  const applyFilter = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
  };

  const toggleSkillFilter = (skill: string) => {
    setFilterSkill(filterSkill === skill ? '' : skill);
  };

  const addPriceFilter = () => {
    // Filter automatically applied via useEffect
  };

  const addTimeFilter = () => {
    // Filter automatically applied via useEffect
  };

  const clearFilter = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSkill('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterStartTime('');
    setFilterEndTime('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setAppliedStartTime('');
    setAppliedEndTime('');
    setFilteredListings(allAvailableListings);
  };

  const handleDayPress = async (day: any) => {
    const dateString = day.dateString;
    
    if (user.isTeacher) {
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
    } else {
      // For learners, show available listings for that day
      const singleDayListings = listings.filter(listing => listing.date === dateString);
      const recurringDayListings = (await generateRecurringDates(recurringListings)).filter(listing => listing.date === dateString);
      const allDayListings = [...singleDayListings, ...recurringDayListings];
      
      if (allDayListings.length > 0) {
        setSelectedDate(dateString);
        setDayListings(allDayListings);
        setDayExclusions([]);
        setShowDayModal(true);
      }
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

  if (!user.isTeacher) {
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Available Lessons</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="funnel-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {(filterStartDate || filterSkill || appliedMinPrice || appliedStartTime) && (
          <View style={styles.filterInfo}>
            <View style={styles.filterTags}>
              {filterStartDate && filterEndDate && (
                <TouchableOpacity style={styles.filterTag} onPress={() => {setFilterStartDate(''); setFilterEndDate('');}}>
                  <Text style={styles.filterTagText}>📅 {new Date(filterStartDate).toLocaleDateString()} ✕</Text>
                </TouchableOpacity>
              )}
              {filterSkill && (
                <TouchableOpacity style={styles.filterTag} onPress={() => setFilterSkill('')}>
                  <Text style={styles.filterTagText}>{filterSkill === 'snowboarding' ? '🏂' : '🎿'} {filterSkill} ✕</Text>
                </TouchableOpacity>
              )}
              {(appliedMinPrice || appliedMaxPrice) && (
                <TouchableOpacity style={styles.filterTag} onPress={() => {setAppliedMinPrice(''); setAppliedMaxPrice('');}}>
                  <Text style={styles.filterTagText}>💰 ${appliedMinPrice || '0'}-${appliedMaxPrice || '∞'} ✕</Text>
                </TouchableOpacity>
              )}
              {(appliedStartTime && appliedEndTime) && (
                <TouchableOpacity style={styles.filterTag} onPress={() => {setAppliedStartTime(''); setAppliedEndTime('');}}>
                  <Text style={styles.filterTagText}>⏰ {formatTime(appliedStartTime)}-{formatTime(appliedEndTime)} ✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={clearFilter}>
              <Text style={styles.clearFilter}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <FlatList
          data={filteredListings}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              </View>
              <View style={styles.listingDetails}>
                <Text style={styles.skillText}>
                  {item.skill === 'snowboarding' ? '🏂' : '🎿'} {item.skill}
                </Text>
                <Text style={styles.locationText}>{item.location}</Text>
                <Text style={styles.teacherText}>Teacher: {item.teacherId}</Text>
              </View>
              <Text style={styles.priceText}>${item.price}/hr</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id || ''}
          style={styles.content}
          showsVerticalScrollIndicator={false}
        />

        <Modal visible={showFilterModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Filters</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView style={styles.filterOptions}>
                <Text style={styles.filterSectionTitle}>📅 Date Range</Text>
                <TouchableOpacity style={[styles.filterOptionButton, (filterStartDate && filterEndDate) && styles.removeButton]} onPress={() => {
                  if (filterStartDate && filterEndDate) {
                    setFilterStartDate(''); setFilterEndDate('');
                  } else {
                    setCurrentFilterType(currentFilterType === 'date' ? 'skill' : 'date');
                  }
                }}>
                  <Text style={[styles.filterOptionText, (filterStartDate && filterEndDate) && {color: 'white'}]}>
                    {filterStartDate && filterEndDate ? 
                      `${new Date(filterStartDate).toLocaleDateString()} - ${new Date(filterEndDate).toLocaleDateString()}` : 
                      'Select dates'}
                  </Text>
                  <Text style={[styles.addFilterText, (filterStartDate && filterEndDate) && {color: 'white'}]}>
                    {filterStartDate && filterEndDate ? 'Remove Filter' : 'Select Dates'}
                  </Text>
                </TouchableOpacity>
                
                {currentFilterType === 'date' && (
                  <Calendar
                    onDayPress={handleFilterDayPress}
                    markedDates={{
                      [filterStartDate]: { selected: true, selectedColor: '#007AFF' },
                      [filterEndDate]: { selected: true, selectedColor: '#007AFF' }
                    }}
                    theme={{
                      selectedDayBackgroundColor: '#007AFF',
                      todayTextColor: '#007AFF',
                      arrowColor: '#007AFF',
                    }}
                  />
                )}
                
                <Text style={styles.filterSectionTitle}>🏂 Sport</Text>
                {['snowboarding', 'skiing'].map(skill => (
                  <TouchableOpacity key={skill} style={[styles.filterOptionButton, filterSkill === skill && {backgroundColor: '#007AFF'}]} onPress={() => toggleSkillFilter(skill)}>
                    <Text style={[styles.filterOptionText, filterSkill === skill && {color: 'white'}]}>
                      {skill === 'snowboarding' ? '🏂 Snowboarding' : '🎿 Skiing'}
                    </Text>
                    <Text style={[styles.addFilterText, filterSkill === skill && {color: 'white'}]}>
                      {filterSkill === skill ? 'Remove Filter' : 'Add Filter'}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                <Text style={styles.filterSectionTitle}>💰 Price Range</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Min Price"
                    value={filterMinPrice}
                    onChangeText={setFilterMinPrice}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Max Price"
                    value={filterMaxPrice}
                    onChangeText={setFilterMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity style={[styles.addButton, (appliedMinPrice || appliedMaxPrice) && styles.removeButton]} onPress={() => {
                  if (appliedMinPrice || appliedMaxPrice) {
                    setAppliedMinPrice(''); setAppliedMaxPrice('');
                  } else {
                    setAppliedMinPrice(filterMinPrice); setAppliedMaxPrice(filterMaxPrice);
                  }
                }}>
                  <Text style={styles.addButtonText}>
                    {(appliedMinPrice || appliedMaxPrice) ? 'Remove Price Filter' : 'Add Price Filter'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.filterSectionTitle}>⏰ Time Range</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Start Time (HH:MM)"
                    value={filterStartTime}
                    onChangeText={setFilterStartTime}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="End Time (HH:MM)"
                    value={filterEndTime}
                    onChangeText={setFilterEndTime}
                  />
                </View>
                <TouchableOpacity style={[styles.addButton, (appliedStartTime && appliedEndTime) && styles.removeButton]} onPress={() => {
                  if (appliedStartTime && appliedEndTime) {
                    setAppliedStartTime(''); setAppliedEndTime('');
                  } else {
                    setAppliedStartTime(filterStartTime); setAppliedEndTime(filterEndTime);
                  }
                }}>
                  <Text style={styles.addButtonText}>
                    {(appliedStartTime && appliedEndTime) ? 'Remove Time Filter' : 'Add Time Filter'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{user.isTeacher ? 'Your Availability' : 'Available Lessons'}</Text>
        {user.isTeacher && onCreateListing && (
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
          {user.isTeacher 
            ? 'Tap on highlighted dates to view your availability for that day'
            : 'Tap on highlighted dates to view available lessons'
          }
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
                {selectedDate ? (() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() + 1);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })() : ''}
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
  bookingHint: {
    fontSize: 10,
    color: '#28a745',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  teacherText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
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
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listingDetails: {
    marginBottom: 8,
  },
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e6f2ff',
  },
  filterText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  clearFilter: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  filterTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  filterTagText: {
    color: 'white',
    fontSize: 12,
  },
  filterOptions: {
    padding: 20,
    flex: 1,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  filterOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  addFilterText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4444',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});