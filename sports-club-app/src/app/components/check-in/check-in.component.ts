import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.css'
})
export class CheckInComponent implements OnInit {
  event: any;
  name = '';
  isCheckedIn = false;
  eventId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    if (this.eventId) {
      this.loadEvent();
      this.checkSessionStorage();
    }
  }

  async loadEvent() {
    this.event = await this.firestoreService.getEvent(this.eventId!);
  }

  checkSessionStorage() {
    const today = new Date().toISOString().slice(0, 10);
    const sessionKey = `${this.eventId}-${today}`;
    if (sessionStorage.getItem(sessionKey)) {
      this.isCheckedIn = true;
    }
  }

  async checkIn() {
    if (this.isCheckedIn) return;

    await this.firestoreService.addAttendance(this.eventId!, { name: this.name });
    const today = new Date().toISOString().slice(0, 10);
    const sessionKey = `${this.eventId}-${today}`;
    sessionStorage.setItem(sessionKey, 'true');
    this.isCheckedIn = true;
  }
}
