import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QuerySnapshot,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export class FirestoreService {
  // Users collection methods
  static async createUser(user: Omit<User, 'id'> & { uid: string }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), user);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Generic collection methods
  static async createDocument(collectionName: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async getDocument(collectionName: string, documentId: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  static async updateDocument(collectionName: string, documentId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  static async getCollection(collectionName: string, queryOptions?: {
    where?: { field: string; operator: any; value: any }[];
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
  }): Promise<DocumentData[]> {
    try {
      let q = collection(db, collectionName);
      let queryRef: any = q;

      if (queryOptions) {
        if (queryOptions.where) {
          queryOptions.where.forEach(condition => {
            queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
          });
        }

        if (queryOptions.orderBy) {
          queryRef = query(queryRef, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction));
        }

        if (queryOptions.limit) {
          queryRef = query(queryRef, limit(queryOptions.limit));
        }
      }

      const querySnapshot = await getDocs(queryRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as DocumentData)
      }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  }
}

export default FirestoreService;