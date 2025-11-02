import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService, Coach } from '../../services/firestore.service';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-coach-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './coach-list.component.html',
  styleUrls: ['./coach-list.component.css']
})
export class CoachListComponent implements OnInit {
  coaches: Coach[] = [];
  filteredCoaches$: Observable<Coach[]> = of([]);
  filter = new FormControl('');

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.firestoreService.getCoaches().subscribe((coaches: Coach[]) => {
      this.coaches = coaches;
      this.filteredCoaches$ = this.filter.valueChanges.pipe(
        startWith(''),
        map(text => this.search(text || ''))
      );
    });
  }

  search(text: string): Coach[] {
    return this.coaches.filter(coach => {
      const term = text.toLowerCase();
      return coach.name.toLowerCase().includes(term)
        || coach.email.toLowerCase().includes(term)
        || coach.bio.toLowerCase().includes(term);
    });
  }

  deleteCoach(id: string): void {
    if (confirm('Are you sure you want to delete this coach?')) {
      this.firestoreService.deleteCoach(id);
    }
  }
}
