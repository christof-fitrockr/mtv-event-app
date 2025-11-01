import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, getDocs, Timestamp, query, where, updateDoc, deleteDoc, collectionGroup } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  // --- Event Management ---

  async createEvent(eventData: any): Promise<string> {
    const eventCollection = collection(this.firestore, 'events');
    const docRef = await addDoc(eventCollection, {
      ...eventData,
      dateCreated: Timestamp.now(),
    });
    return docRef.id;
  }

  async getEvent(eventId: string): Promise<any> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    const docSnap = await getDoc(eventDoc);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async getAllEvents(): Promise<any[]> {
    const eventCollection = collection(this.firestore, 'events');
    const querySnapshot = await getDocs(eventCollection);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async updateEvent(eventId: string, eventData: any): Promise<void> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    await updateDoc(eventDoc, eventData);
  }

  async deleteEvent(eventId: string): Promise<void> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    await deleteDoc(eventDoc);
  }

  async getEventStatistics(): Promise<any[]> {
    const events = await this.getAllEvents();
    const attendanceQuery = query(collectionGroup(this.firestore, 'attendance'));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceByEvent: { [key: string]: number } = {};

    attendanceSnapshot.docs.forEach(doc => {
      const eventId = doc.ref.parent.parent?.id;
      if (eventId) {
        if (!attendanceByEvent[eventId]) {
          attendanceByEvent[eventId] = 0;
        }
        attendanceByEvent[eventId]++;
      }
    });

    return events.map(event => {
      const occupancy = attendanceByEvent[event.id] || 0;
      const occupancyPercentage = event.capacity > 0 ? (occupancy / event.capacity) * 100 : 0;
      return {
        ...event,
        occupancy,
        occupancyPercentage,
      };
    });
  }

  // --- Attendance Management ---

  async addAttendance(eventId: string, attendanceData: any): Promise<void> {
    const attendanceCollection = collection(this.firestore, 'events', eventId, 'attendance');
    await addDoc(attendanceCollection, {
      ...attendanceData,
      checkInTime: Timestamp.now(),
      dateOfEvent: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    });
  }

  async getAttendance(eventId: string, date: string): Promise<any[]> {
    const attendanceCollection = collection(this.firestore, 'events', eventId, 'attendance');
    const q = query(attendanceCollection, where('dateOfEvent', '==', date));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // --- Location Management ---

  async getLocations(): Promise<any[]> {
    const locationCollection = collection(this.firestore, 'locations');
    const querySnapshot = await getDocs(locationCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addLocation(locationData: any): Promise<string> {
    const locationCollection = collection(this.firestore, 'locations');
    const docRef = await addDoc(locationCollection, locationData);
    return docRef.id;
  }

  async updateLocation(locationId: string, locationData: any): Promise<void> {
    const locationDoc = doc(this.firestore, 'locations', locationId);
    await updateDoc(locationDoc, locationData);
  }

  async deleteLocation(locationId: string): Promise<void> {
    const locationDoc = doc(this.firestore, 'locations', locationId);
    await deleteDoc(locationDoc);
  }
}
