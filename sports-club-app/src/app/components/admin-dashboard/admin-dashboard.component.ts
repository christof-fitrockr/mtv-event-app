import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  events: any[] = [];
  newEvent = {
    title: '',
    description: '',
    location: '',
    recurrence: {
      type: 'weekly',
      days: [] as string[],
      time: ''
    },
    qrCodeData: ''
  };
  daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  selectedEventId: string | null = null;
  selectedDate: string = new Date().toISOString().slice(0, 10);
  attendance: any[] = [];

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents() {
    this.events = await this.firestoreService.getAllEvents();
  }

  onDayChange(event: any) {
    const day = event.target.value;
    if (event.target.checked) {
      this.newEvent.recurrence.days.push(day);
    } else {
      this.newEvent.recurrence.days = this.newEvent.recurrence.days.filter(d => d !== day);
    }
  }

  async createEvent() {
    const eventId = await this.firestoreService.createEvent(this.newEvent);
    const checkinUrl = `${window.location.origin}/checkin/${eventId}`;
    await this.firestoreService.updateEvent(eventId, { qrCodeData: checkinUrl });
    this.loadEvents();
  }

  viewAttendance(eventId: string) {
    this.selectedEventId = eventId;
    this.loadAttendance();
  }

  async loadAttendance() {
    if (this.selectedEventId) {
      this.attendance = await this.firestoreService.getAttendance(this.selectedEventId, this.selectedDate);
    }
  }
}
