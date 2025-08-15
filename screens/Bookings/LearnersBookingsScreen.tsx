import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { User, Listing, RecurringListing } from '../../types';
import ListingService from '../../services/listingService';
import { formatTime, generateRecurringDates, formatShortDate } from '../../utils/bookingUtils';

interface LearnersBookingsScreenProps {
  user: User;
}

export default function LearnersBookingsScreen({ user }: LearnersBookingsScreenProps) {
  const [allAvailableListings, setAllAvailableListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
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



  const loadListings = async () => {
    try {
      // For learners, show all available listings from all teachers
      const [allSingleListings, allRecurringListings] = await Promise.all([
        ListingService.getAllAvailableListings(),
        ListingService.getAllRecurringListings()
      ]);
      
      const generatedFromRecurring = await generateRecurringDates(allRecurringListings);
      const combinedListings = [...allSingleListings, ...generatedFromRecurring];
      
      setAllAvailableListings(combinedListings);
      setFilteredListings(combinedListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
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
                {formatShortDate(item.date)}
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
              <Text style={styles.teacherText}>
                Teacher: {item.teacherFirstName && item.teacherLastName 
                  ? `${item.teacherFirstName} ${item.teacherLastName.charAt(0)}.` 
                  : 'Loading...'}
              </Text>
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
  teacherText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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