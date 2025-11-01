import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-manage-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-locations.component.html',
  styleUrls: ['./manage-locations.css']
})
export class ManageLocationsComponent implements OnInit {
  locations: any[] = [];
  location: any = { name: '', address: '' };
  showForm = false;
  editingLocation = false;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.loadLocations();
  }

  async loadLocations() {
    this.locations = await this.firestoreService.getLocations();
  }

  showAddForm() {
    this.showForm = true;
    this.editingLocation = false;
    this.location = { name: '', address: '' };
  }

  editLocation(loc: any) {
    this.showForm = true;
    this.editingLocation = true;
    this.location = { ...loc };
  }

  cancel() {
    this.showForm = false;
  }

  async saveLocation() {
    if (this.editingLocation) {
      await this.firestoreService.updateLocation(this.location.id, this.location);
    } else {
      await this.firestoreService.addLocation(this.location);
    }
    this.loadLocations();
    this.showForm = false;
  }

  async deleteLocation(id: string) {
    await this.firestoreService.deleteLocation(id);
    this.loadLocations();
  }
}
