import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QrCodeComponent } from 'ng-qrcode';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, QrCodeComponent, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  events: any[] = [];
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

  viewAttendance(eventId: string) {
    this.selectedEventId = eventId;
    this.loadAttendance();
  }

  async loadAttendance() {
    if (this.selectedEventId) {
      this.attendance = await this.firestoreService.getAttendance(this.selectedEventId, this.selectedDate);
    }
  }

  get selectedEventTitle(): string {
    if (!this.selectedEventId) return '';
    const event = this.events.find(e => e.id === this.selectedEventId);
    return event ? event.title : '';
  }
}
