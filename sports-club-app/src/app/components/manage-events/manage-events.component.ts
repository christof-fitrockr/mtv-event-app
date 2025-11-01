import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.css']
})
export class ManageEventsComponent implements OnInit {
  events: any[] = [];
  locations: any[] = [];
  event: any = {
    title: '',
    description: '',
    location: '',
    capacity: 0,
    recurrence: {
      type: 'weekly',
      days: [] as string[],
      time: ''
    },
    qrCodeData: ''
  };
  showForm = false;
  editingEvent = false;
  daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadEvents();
    this.loadLocations();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'add') {
        this.showAddForm();
      }
    });
  }

  async loadEvents() {
    this.events = await this.firestoreService.getAllEvents();
  }

  async loadLocations() {
    this.locations = await this.firestoreService.getLocations();
  }

  showAddForm() {
    this.showForm = true;
    this.editingEvent = false;
    this.event = {
      title: '',
      description: '',
      location: '',
      capacity: 0,
      recurrence: {
        type: 'weekly',
        days: [] as string[],
        time: ''
      },
      qrCodeData: ''
    };
  }

  editEvent(ev: any) {
    this.showForm = true;
    this.editingEvent = true;
    this.event = { ...ev };
  }

  cancel() {
    this.showForm = false;
  }

  onDayChange(event: any) {
    const day = event.target.value;
    if (event.target.checked) {
      this.event.recurrence.days.push(day);
    } else {
      this.event.recurrence.days = this.event.recurrence.days.filter((d: string) => d !== day);
    }
  }

  async saveEvent() {
    if (this.editingEvent) {
      await this.firestoreService.updateEvent(this.event.id, this.event);
    } else {
      const eventId = await this.firestoreService.createEvent(this.event);
      const checkinUrl = `${window.location.origin}/checkin/${eventId}`;
      await this.firestoreService.updateEvent(eventId, { qrCodeData: checkinUrl });
    }
    this.loadEvents();
    this.showForm = false;
  }

  async deleteEvent(id: string) {
    await this.firestoreService.deleteEvent(id);
    this.loadEvents();
  }
}
