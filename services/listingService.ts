import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing, RecurringListing } from '../types';

class ListingService {
  private collectionName = 'singleListings';
  private recurringCollectionName = 'recurringListings';
  private exclusionsCollectionName = 'exclusionlistings';

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
            teacherFirstName: data.teacherFirstName || '',
            teacherLastName: data.teacherLastName || '',
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location,
            price: data.price,
            skill: data.skill,
            createdAt: data.createdAt?.toDate() || new Date(),
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
          teacherFirstName: data.teacherFirstName || '',
          teacherLastName: data.teacherLastName || '',
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt?.toDate() || new Date(),
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
          teacherFirstName: data.teacherFirstName || '',
          teacherLastName: data.teacherLastName || '',
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      return listings;
    } catch (error) {
      console.error('Error getting teacher recurring listings:', error);
      throw error;
    }
  }

  async getAllAvailableListings(): Promise<Listing[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      const listings: Listing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          teacherId: data.teacherId,
          teacherFirstName: data.teacherFirstName || '',
          teacherLastName: data.teacherLastName || '',
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      return listings;
    } catch (error) {
      console.error('Error getting all available listings:', error);
      throw error;
    }
  }

  async getAllRecurringListings(): Promise<RecurringListing[]> {
    try {
      const q = query(collection(db, this.recurringCollectionName));
      const querySnapshot = await getDocs(q);
      const listings: RecurringListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          teacherId: data.teacherId,
          teacherFirstName: data.teacherFirstName || '',
          teacherLastName: data.teacherLastName || '',
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      return listings;
    } catch (error) {
      console.error('Error getting all recurring listings:', error);
      throw error;
    }
  }

  async getExclusions(recurringListingId: string): Promise<string[]> {
    try {
      const q = query(
        collection(db, this.exclusionsCollectionName),
        where('recurringListingId', '==', recurringListingId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data().date);
    } catch (error) {
      console.error('Error getting exclusions:', error);
      return [];
    }
  }

  async getAllTeacherExclusions(teacherId: string): Promise<{date: string, recurringListingId: string}[]> {
    try {
      const q = query(
        collection(db, this.exclusionsCollectionName),
        where('teacherId', '==', teacherId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        date: doc.data().date,
        recurringListingId: doc.data().recurringListingId
      }));
    } catch (error) {
      console.error('Error getting teacher exclusions:', error);
      return [];
    }
  }

  async addExclusion(recurringListingId: string, date: string): Promise<void> {
    try {
      const recurringListing = await this.getRecurringListingById(recurringListingId);
      if (!recurringListing) throw new Error('Recurring listing not found');
      
      await addDoc(collection(db, this.exclusionsCollectionName), {
        recurringListingId,
        teacherId: recurringListing.teacherId,
        date,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding exclusion:', error);
      throw error;
    }
  }

  async removeExclusion(recurringListingId: string, date: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.exclusionsCollectionName),
        where('recurringListingId', '==', recurringListingId),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, this.exclusionsCollectionName, docSnapshot.id));
      });
    } catch (error) {
      console.error('Error removing exclusion:', error);
      throw error;
    }
  }

  private async getRecurringListingById(id: string): Promise<RecurringListing | null> {
    try {
      const docRef = doc(db, this.recurringCollectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          teacherId: data.teacherId,
          teacherFirstName: data.teacherFirstName || '',
          teacherLastName: data.teacherLastName || '',
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          location: data.location,
          price: data.price,
          skill: data.skill,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting recurring listing by ID:', error);
      return null;
    }
  }

  async deleteListing(listingId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, listingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }

  async deleteRecurringListing(recurringListingId: string): Promise<void> {
    try {
      const docRef = doc(db, this.recurringCollectionName, recurringListingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting recurring listing:', error);
      throw error;
    }
  }
}

export default new ListingService();