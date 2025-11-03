import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateAdapter, provideCalendar, CalendarEvent, CalendarView, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, CalendarDatePipe } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FirestoreService } from '../../services/firestore.service';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { EventDetailsComponent } from '../event-details/event-details.component';

interface MyCalendarEvent extends CalendarEvent {
  location: any;
  coaches: any[];
  description: string;
  maxParticipants: number;
  occupation: number;
  averageOccupation: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, EventDetailsComponent],
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
  view: CalendarView | 'table' = CalendarView.Week;
  viewDate: Date = new Date();
  events: MyCalendarEvent[] = [];
  locations: any[] = [];
  locationFilter: string = '';
  CalendarView = CalendarView;
  selectedEvent: MyCalendarEvent | null = null;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents() {
    const [dbEvents, locations, coaches, attendance] = await Promise.all([
      this.firestoreService.getAllEvents(),
      this.firestoreService.getLocations(),
      this.firestoreService.getAllCoaches(),
      this.firestoreService.getAllAttendance()
    ]);

    const locationsMap = new Map(locations.map(l => [l.id, l]));
    const coachesMap = new Map(coaches.map(c => [c.id, c]));
    const attendanceMap = new Map<string, number>();

    attendance.forEach(att => {
      const key = `${att.eventId}-${att.dateOfEvent}`;
      attendanceMap.set(key, (attendanceMap.get(key) || 0) + 1);
    });

    const calendarEvents: MyCalendarEvent[] = [];
    const dayMap = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    for (const event of dbEvents) {
      if (event.startDate && event.endDate && event.schedule) {
        for (const slot of event.schedule) {
          let current = new Date(event.startDate);
          const end = new Date(event.endDate);
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);
          const targetDay = dayMap[slot.day as keyof typeof dayMap];

          while (current <= end) {
            if (current.getDay() === targetDay) {
              const dateStr = current.toISOString().split('T')[0];
              const occupation = attendanceMap.get(`${event.id}-${dateStr}`) || 0;

              calendarEvents.push({
                start: setMinutes(setHours(startOfDay(current), startHour), startMinute),
                end: setMinutes(setHours(startOfDay(current), endHour), endMinute),
                title: `${event.name} (${occupation}/${event.maxParticipants || 'N/A'})`,
                location: locationsMap.get(event.locationId),
                coaches: (event.coachIds || []).map((coachId: string) => coachesMap.get(coachId)),
                description: event.description,
                maxParticipants: event.maxParticipants,
                occupation: occupation,
                averageOccupation: event.averageOccupation,
              });
            }
            current = addDays(current, 1);
          }
        }
      }
    }
    this.events = calendarEvents;
    this.locations = locations;
  }

  filterEvents() {
    // This will be implemented later if needed
  }

  setView(view: CalendarView | 'table') {
    this.view = view;
    if (view === 'table') {
      this.events.sort((a, b) => a.start.getTime() - b.start.getTime());
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.selectedEvent = event as MyCalendarEvent;
  }

  closeModal(): void {
    this.selectedEvent = null;
  }
}
