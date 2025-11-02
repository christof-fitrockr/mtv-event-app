import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirestoreService, Location } from '../../services/firestore.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-location-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './location-edit.component.html',
  styleUrls: ['./location-edit.component.css']
})
export class LocationEditComponent implements OnInit {
  location: Location = { name: '', address: '' };
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
          return this.firestoreService.getLocation(id);
        } else {
          this.isNew = true;
          return of({ name: '', address: '' });
        }
      })
    ).subscribe(location => {
      this.location = location;
    });
  }

  saveLocation(): void {
    if (this.isNew) {
      this.firestoreService.addLocation(this.location).then(() => {
        this.router.navigate(['/admin/locations']);
      });
    } else {
      const { id, ...locationData } = this.location;
      this.firestoreService.updateLocation(id!, locationData).then(() => {
        this.router.navigate(['/admin/locations']);
      });
    }
  }
}
