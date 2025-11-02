import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirestoreService, Coach } from '../../services/firestore.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-coach-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './coach-edit.component.html',
  styleUrls: ['./coach-edit.component.css']
})
export class CoachEditComponent implements OnInit {
  coach: Coach = { name: '', email: '', bio: '' };
  isNew = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isNew = false;
          return this.firestoreService.getCoach(id);
        } else {
          this.isNew = true;
          return of({ name: '', email: '', bio: '' });
        }
      })
    ).subscribe(coach => {
      this.coach = coach;
    });
  }

  saveCoach(): void {
    if (this.isNew) {
      this.firestoreService.addCoach(this.coach).then(() => {
        this.router.navigate(['/admin/coaches']);
      });
    } else {
      this.firestoreService.updateCoach(this.coach).then(() => {
        this.router.navigate(['/admin/coaches']);
      });
    }
  }
}
