import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent {
  @Input() event: any;
  @Output() closeModal = new EventEmitter<void>();

  showCoachDetails = false;
  showLocationDetails = false;
  showAttendees = false;
  attendees: any[] = [];

  constructor(private sanitizer: DomSanitizer, private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.loadAttendees();
  }

  async loadAttendees() {
    if (this.event) {
      const dateStr = this.event.start.toISOString().split('T')[0];
      this.attendees = await this.firestoreService.getAttendance(this.event.id, dateStr);
    }
  }

  get mapUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${this.event.location.longitude-.01}%2C${this.event.location.latitude-.01}%2C${this.event.location.longitude+.01}%2C${this.event.location.latitude+.01}&layer=mapnik&marker=${this.event.location.latitude}%2C${this.event.location.longitude}`);
  }

  onClose() {
    this.closeModal.emit();
  }
}
