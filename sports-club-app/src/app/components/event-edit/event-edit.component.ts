import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {Event, FirestoreService, Location, Schedule} from '../../services/firestore.service';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.css']
})
export class EventEditComponent implements OnInit {
  event: Event = { name: '', locationId: '', description: '', startDate: '', endDate: '', coachIds: [], schedule: [] };
  isNew = true;
  newSchedule: Schedule = { day: 'Monday', startTime: '', endTime: '' };
  locations: Location[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.firestoreService.getLocations().then(locations => {
      this.locations = locations;
    });
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isNew = false;
          return this.firestoreService.getEvent(id);
        } else {
          this.isNew = true;
          return of({ name: '', locationId: '', description: '', startDate: '', endDate: '', coachIds: [], schedule: [] });
        }
      })
    ).subscribe(event => {
      this.event = event;
      if (!this.event.schedule) {
        this.event.schedule = [];
      }
      if (this.event.description === undefined || this.event.description === null) {
        this.event.description = '';
      }
    });
  }

  saveEvent(): void {
    if (this.isNew) {
      this.firestoreService.createEvent(this.event).then(() => {
        this.router.navigate(['/admin/events']);
      });
    } else {
      this.firestoreService.updateEvent(this.event.id!, this.event).then(() => {
        this.router.navigate(['/admin/events']);
      });
    }
  }

  addSchedule(): void {
    if (this.newSchedule.startTime && this.newSchedule.endTime) {
      this.event.schedule.push({ ...this.newSchedule });
      this.newSchedule.startTime = '';
      this.newSchedule.endTime = '';
    }
  }

  removeSchedule(index: number): void {
    this.event.schedule.splice(index, 1);
  }
}
