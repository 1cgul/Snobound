import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing, RecurringListing } from '../types';

class ListingService {
  private collectionName = 'singleListings';
  private recurringCollectionName = 'recurringListings';

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private hasTimeConflict(newStart: string, newEnd: string, existingStart: string, existingEnd: string): boolean {
    const newStartMin = this.timeToMinutes(newStart);
    const newEndMin = this.timeToMinutes(newEnd);
    const existingStartMin = this.timeToMinutes(existingStart);
    const existingEndMin = this.timeToMinutes(existingEnd);
    
    // Check if times overlap
    return newStartMin < existingEndMin && newEndMin > existingStartMin;
  }

  async checkForConflicts(teacherId: string, date: string, startTime: string, endTime: string): Promise<Listing[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('teacherId', '==', teacherId),
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      const conflicts: Listing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (this.hasTimeConflict(startTime, endTime, data.startTime, data.endTime)) {
          conflicts.push({
            id: doc.id,
            teacherId: data.teacherId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location,
            price: data.price,
            skill: data.skill,
            createdAt: data.createdAt.toDate(),
          });
        }
      });
      
      return conflicts;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      throw error;
    }
  }

  async createListing(listingData: Omit<Listing, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Check conflicts with single listings
      const singleConflicts = await this.checkForConflicts(
        listingData.teacherId,
        listingData.date,
        listingData.startTime,
        listingData.endTime
      );
      
      // Check conflicts with recurring listings
      const recurringListings = await this.getTeacherRecurringListings(listingData.teacherId);
      const dateObj = new Date(listingData.date);
      const dayOfWeek = dateObj.getDay();
      
      const recurringConflicts = recurringListings.filter(recur => 
        recur.dayOfWeek === dayOfWeek &&
        dateObj >= recur.startDate &&
        dateObj <= recur.endDate &&
        this.hasTimeConflict(listingData.startTime, listingData.endTime, recur.startTime, recur.endTime)
      );
      
      if (singleConflicts.length > 0 || recurringConflicts.length > 0) {
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour}:${minutes} ${ampm}`;
        };
        
        const conflict = singleConflicts[0] || {
          startTime: recurringConflicts[0].startTime,
          endTime: recurringConflicts[0].endTime
        };
        
        throw new Error(`Time conflict detected! You already have availability from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on this date.`);
      }
      
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...listingData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  async getTeacherListings(teacherId: string): Promise<Listing[]> {
    try {
      console.log('Querying listings for teacherId:', teacherId);
      
      const q = query(
        collection(db, this.collectionName),
        where('teacherId', '==', teacherId),
        orderBy('date', 'desc'),
        orderBy('startTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Query returned', querySnapshot.size, 'documents');
      
      const listings: Listing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Found listing:', { id: doc.id, teacherId: data.teacherId, date: data.date });
        listings.push({
          id: doc.id,
          teacherId: data.teacherId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      console.log('Returning', listings.length, 'listings');
      return listings;
    } catch (error) {
      console.error('Error getting teacher listings:', error);
      throw error;
    }
  }

  async createRecurringListing(listingData: Omit<RecurringListing, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Check conflicts with existing recurring listings on same day
      const existingRecurring = await this.getTeacherRecurringListings(listingData.teacherId);
      const conflicts = existingRecurring.filter(existing =>
        existing.dayOfWeek === listingData.dayOfWeek &&
        this.hasTimeConflict(listingData.startTime, listingData.endTime, existing.startTime, existing.endTime)
      );
      
      if (conflicts.length > 0) {
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour}:${minutes} ${ampm}`;
        };
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        throw new Error(`Time conflict detected! You already have recurring availability on ${dayNames[listingData.dayOfWeek]} from ${formatTime(conflicts[0].startTime)} to ${formatTime(conflicts[0].endTime)}.`);
      }
      
      const docRef = await addDoc(collection(db, this.recurringCollectionName), {
        ...listingData,
        startDate: Timestamp.fromDate(listingData.startDate),
        endDate: Timestamp.fromDate(listingData.endDate),
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating recurring listing:', error);
      throw error;
    }
  }

  async getTeacherRecurringListings(teacherId: string): Promise<RecurringListing[]> {
    try {
      const q = query(
        collection(db, this.recurringCollectionName),
        where('teacherId', '==', teacherId)
      );
      
      const querySnapshot = await getDocs(q);
      const listings: RecurringListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          teacherId: data.teacherId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      return listings;
    } catch (error) {
      console.error('Error getting teacher recurring listings:', error);
      throw error;
    }
  }
}

export default new ListingService();