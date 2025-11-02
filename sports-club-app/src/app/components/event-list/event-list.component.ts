import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService, Event } from '../../services/firestore.service';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents$: Observable<Event[]> = of([]);
  filter = new FormControl('');
  locationsMap: { [id: string]: string } = {};

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit(): Promise<void> {
    const [events, locations] = await Promise.all([
      this.firestoreService.getAllEvents(),
      this.firestoreService.getLocations()
    ]);
    this.events = events;
    locations.forEach(location => {
      this.locationsMap[location.id] = location.name;
    });
    this.filteredEvents$ = this.filter.valueChanges.pipe(
      startWith(''),
      map(text => this.search(text || ''))
    );
  }

  search(text: string): Event[] {
    return this.events.filter(event => {
      const term = text.toLowerCase();
      const nameMatch = event.name && event.name.toLowerCase().includes(term);
      const locationMatch = event.locationId && this.locationsMap[event.locationId] && this.locationsMap[event.locationId].toLowerCase().includes(term);
      const startDateMatch = event.startDate && event.startDate.toLowerCase().includes(term);
      const endDateMatch = event.endDate && event.endDate.toLowerCase().includes(term);
      return nameMatch || locationMatch || startDateMatch || endDateMatch;
    });
  }

  deleteEvent(id: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.firestoreService.deleteEvent(id);
    }
  }
}
