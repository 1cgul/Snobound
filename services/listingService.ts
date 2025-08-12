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

  async createListing(listingData: Omit<Listing, 'id' | 'createdAt'>): Promise<string> {
    try {
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
      const q = query(
        collection(db, this.collectionName),
        where('teacherId', '==', teacherId),
        orderBy('date', 'desc'),
        orderBy('startTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const listings: Listing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
      
      return listings;
    } catch (error) {
      console.error('Error getting teacher listings:', error);
      throw error;
    }
  }
}

export default new ListingService();