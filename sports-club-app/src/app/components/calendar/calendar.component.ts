import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule, DateAdapter, CalendarEvent } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FirestoreService } from '../../services/firestore.service';

interface MyCalendarEvent extends CalendarEvent {
  location: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.css'],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
  ],
})
export class CalendarComponent implements OnInit {
  view: string = 'month';
  viewDate: Date = new Date();
  events: MyCalendarEvent[] = [];
  filteredEvents: MyCalendarEvent[] = [];
  locations: any[] = [];
  locationFilter: string = '';

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadLocations();
  }

  async loadEvents() {
    const events = await this.firestoreService.getAllEvents();
    this.events = events.map(event => ({
      start: new Date(event.recurrence.time),
      title: event.title,
      location: event.location,
    }));
    this.filterEvents();
  }

  async loadLocations() {
    this.locations = await this.firestoreService.getLocations();
  }

  filterEvents() {
    if (this.locationFilter) {
      this.filteredEvents = this.events.filter(event => event.location === this.locationFilter);
    } else {
      this.filteredEvents = this.events;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    alert(`Event ${action}: ${event.title}`);
  }
}
