import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, getDocs, Timestamp, query, where, updateDoc, deleteDoc, collectionGroup, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { addDays } from 'date-fns';

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

  async addAttendance(eventId: string, date: string, attendanceData: any): Promise<void> {
    const attendanceCollection = collection(this.firestore, 'events', eventId, 'attendance');
    await addDoc(attendanceCollection, {
      ...attendanceData,
      checkInTime: Timestamp.now(),
      dateOfEvent: date,
    });

    // Recalculate average occupation
    const event = await this.getEvent(eventId);
    if (event) {
      const allAttendance = await this.getAllAttendanceForEvent(eventId);
      const totalCapacity = this.calculateTotalCapacity(event);
      const averageOccupation = totalCapacity > 0 ? (allAttendance.length / totalCapacity) * 100 : 0;
      await this.updateEvent(eventId, { averageOccupation });
    }
  }

  async getAllAttendanceForEvent(eventId: string): Promise<any[]> {
    const attendanceCollection = collection(this.firestore, 'events', eventId, 'attendance');
    const querySnapshot = await getDocs(attendanceCollection);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  calculateTotalCapacity(event: any): number {
    let totalCapacity = 0;
    if (event.startDate && event.endDate && event.recurrenceDays && event.maxParticipants) {
      let current = new Date(event.startDate);
      const end = new Date(event.endDate);
      const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      while (current <= end) {
        const dayOfWeek = dayMap[current.getDay()];
        if (event.recurrenceDays.includes(dayOfWeek)) {
          totalCapacity += event.maxParticipants;
        }
        current = addDays(current, 1);
      }
    }
    return totalCapacity;
  }

  async getAttendance(eventId: string, date: string): Promise<any[]> {
    const attendanceCollection = collection(this.firestore, 'events', eventId, 'attendance');
    const q = query(attendanceCollection, where('dateOfEvent', '==', date));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getAttendanceForEventInstance(eventId: string, date: string): Promise<number> {
    const attendance = await this.getAttendance(eventId, date);
    return attendance.length;
  }

  async getAllAttendance(): Promise<any[]> {
    const attendanceQuery = query(collectionGroup(this.firestore, 'attendance'));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    return attendanceSnapshot.docs.map(doc => {
      const eventId = doc.ref.parent.parent?.id;
      return { id: doc.id, eventId, ...doc.data() };
    });
  }

  // --- Location Management ---

  async getLocations(): Promise<any[]> {
    const locationCollection = collection(this.firestore, 'locations');
    const querySnapshot = await getDocs(locationCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getLocation(locationId: string): Promise<any> {
    const locationDoc = doc(this.firestore, 'locations', locationId);
    const docSnap = await getDoc(locationDoc);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
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

  // --- Coach Management ---

  getCoaches(): Observable<any[]> {
    const coachCollection = collection(this.firestore, 'coaches');
    return collectionData(coachCollection, { idField: 'id' });
  }

  async getAllCoaches(): Promise<any[]> {
    const coachCollection = collection(this.firestore, 'coaches');
    const querySnapshot = await getDocs(coachCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCoach(coachId: string): Promise<any> {
    const coachDoc = doc(this.firestore, 'coaches', coachId);
    const docSnap = await getDoc(coachDoc);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async addCoach(coachData: any): Promise<string> {
    const coachCollection = collection(this.firestore, 'coaches');
    const docRef = await addDoc(coachCollection, coachData);
    return docRef.id;
  }

  async updateCoach(coach: any): Promise<void> {
    const coachDoc = doc(this.firestore, 'coaches', coach.id);
    await updateDoc(coachDoc, coach);
  }

  async deleteCoach(coachId: string): Promise<void> {
    const coachDoc = doc(this.firestore, 'coaches', coachId);
    await deleteDoc(coachDoc);
  }
}
