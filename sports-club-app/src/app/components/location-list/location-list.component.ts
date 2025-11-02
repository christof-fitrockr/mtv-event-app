import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService, Location } from '../../services/firestore.service';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent implements OnInit {
  locations: Location[] = [];
  filteredLocations$: Observable<Location[]> = of([]);
  filter = new FormControl('');

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit(): Promise<void> {
    this.locations = await this.firestoreService.getLocations();
    this.filteredLocations$ = this.filter.valueChanges.pipe(
      startWith(''),
      map(text => this.search(text || ''))
    );
  }

  search(text: string): Location[] {
    return this.locations.filter(location => {
      const term = text.toLowerCase();
      return location.name.toLowerCase().includes(term)
        || location.address.toLowerCase().includes(term);
    });
  }

  deleteLocation(id: string): void {
    if (confirm('Are you sure you want to delete this location?')) {
      this.firestoreService.deleteLocation(id);
    }
  }
}
