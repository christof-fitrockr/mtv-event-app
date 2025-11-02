import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateAdapter, provideCalendar, CalendarEvent, CalendarView, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, CalendarDatePipe } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FirestoreService } from '../../services/firestore.service';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';

interface MyCalendarEvent extends CalendarEvent {
  location: string;
  coaches: string[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, CalendarDatePipe],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.css'],
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  events: MyCalendarEvent[] = [];
  locations: any[] = [];
  locationFilter: string = '';
  CalendarView = CalendarView;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadLocations();
  }

  async loadEvents() {
    const dbEvents = await this.firestoreService.getAllEvents();
    const calendarEvents: MyCalendarEvent[] = [];
    const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    dbEvents.forEach(event => {
      if (event.startDate && event.endDate && event.recurrenceDays && event.startTime && event.endTime) {
        let current = new Date(event.startDate);
        const end = new Date(event.endDate);
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        while (current <= end) {
          const dayOfWeek = dayMap[current.getDay()];
          if (event.recurrenceDays.includes(dayOfWeek)) {
            const start = setMinutes(setHours(startOfDay(current), startHour), startMinute);
            const end = setMinutes(setHours(startOfDay(current), endHour), endMinute);
            calendarEvents.push({
              start,
              end,
              title: event.title,
              location: event.location,
              coaches: event.coaches || [],
            });
          }
          current = addDays(current, 1);
        }
      }
    });
    this.events = calendarEvents;
  }

  async loadLocations() {
    this.locations = await this.firestoreService.getLocations();
  }

  filterEvents() {
    // This will be implemented later if needed
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const myEvent = event as MyCalendarEvent;
    const coaches = myEvent.coaches?.join(', ');
    alert(`Event ${action}: ${event.title}\nCoaches: ${coaches}`);
  }
}
