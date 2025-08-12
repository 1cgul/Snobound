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
import { Listing } from '../types';

class ListingService {
  private collectionName = 'singleListings';

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
      // Check for time conflicts
      const conflicts = await this.checkForConflicts(
        listingData.teacherId,
        listingData.date,
        listingData.startTime,
        listingData.endTime
      );
      
      if (conflicts.length > 0) {
        const conflict = conflicts[0];
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour}:${minutes} ${ampm}`;
        };
        
        throw new Error(`Time conflict detected! You already have a listing from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on this date.`);
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
}

export default new ListingService();