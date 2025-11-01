import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.css']
})
export class CreateEventComponent implements OnInit {
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
  locations: any[] = [];

  constructor(private firestoreService: FirestoreService, private router: Router) { }

  ngOnInit(): void {
    this.loadLocations();
  }

  async loadLocations() {
    this.locations = await this.firestoreService.getLocations();
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
    this.router.navigate(['/admin']);
  }
}
