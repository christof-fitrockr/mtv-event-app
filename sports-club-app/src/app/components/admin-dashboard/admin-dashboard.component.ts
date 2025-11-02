import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  events: any[] = [];
  filteredEvents$: Observable<any[]> = of([]);
  filter = new FormControl('');
  selectedEventId: string | null = null;
  selectedDate: string = new Date().toISOString().slice(0, 10);
  attendance: any[] = [];

  // Modal properties
  isModalOpen = false;
  modalTitle = '';
  modalContent = '';
  modalContentType: 'text' | 'qr' = 'text';

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents() {
    this.events = await this.firestoreService.getAllEvents();
    this.filteredEvents$ = this.filter.valueChanges.pipe(
      startWith(''),
      map(text => this.search(text || ''))
    );
  }

  search(text: string): any[] {
    return this.events.filter(event => {
      const term = text.toLowerCase();
      const nameMatch = event.name && event.name.toLowerCase().includes(term);
      const descriptionMatch = event.description && event.description.toLowerCase().includes(term);
      return nameMatch || descriptionMatch;
    });
  }

  truncateDescription(description: string): string {
    if (!description) {
      return '';
    }
    return description.length > 150 ? description.substring(0, 150) : description;
  }

  openDescriptionModal(event: any): void {
    this.modalTitle = event.name;
    this.modalContent = event.description;
    this.modalContentType = 'text';
    this.isModalOpen = true;
  }

  openQrModal(event: any): void {
    this.modalTitle = `QR Code for ${event.name}`;
    this.modalContent = `${window.location.origin}/checkin/${event.id}`;
    this.modalContentType = 'qr';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  viewAttendance(eventId: string) {
    this.selectedEventId = eventId;
    this.loadAttendance();
  }

  async loadAttendance() {
    if (this.selectedEventId) {
      this.attendance = await this.firestoreService.getAttendance(this.selectedEventId, this.selectedDate);
    }
  }

  get selectedEventTitle(): string {
    if (!this.selectedEventId) return '';
    const event = this.events.find(e => e.id === this.selectedEventId);
    return event ? event.title : '';
  }
}
