import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirestoreService, Event, Schedule, Location } from '../../services/firestore.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MarkdownEditorModule } from 'ngx-markdown-editor';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MarkdownEditorModule],
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
