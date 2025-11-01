import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { differenceInMilliseconds, parseISO } from 'date-fns';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent implements OnInit {
  event: any;
  name = '';
  isCheckedIn = false;
  eventId: string | null = null;
  eventDates: string[] = [];
  selectedDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    if (this.eventId) {
      this.loadEventAndDates();
    }
  }

  async loadEventAndDates() {
    this.event = await this.firestoreService.getEvent(this.eventId!);
    if (this.event) {
      this.generateEventDates();
      this.preselectClosestDate();
      this.checkSessionStorage();
    }
  }

  generateEventDates() {
    if (!this.event.startDate || !this.event.endDate || !this.event.recurrenceDays) {
      return;
    }

    const dates = [];
    let current = new Date(this.event.startDate);
    const end = new Date(this.event.endDate);
    const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    while (current <= end) {
      const dayOfWeek = dayMap[current.getDay()];
      if (this.event.recurrenceDays.includes(dayOfWeek)) {
        dates.push(current.toISOString().slice(0, 10));
      }
      current.setDate(current.getDate() + 1);
    }
    this.eventDates = dates;
  }

  preselectClosestDate() {
    if (this.eventDates.length === 0) return;

    const today = new Date();
    let closestDate = this.eventDates[0];
    let minDiff = Math.abs(differenceInMilliseconds(parseISO(closestDate), today));

    for (let i = 1; i < this.eventDates.length; i++) {
      const diff = Math.abs(differenceInMilliseconds(parseISO(this.eventDates[i]), today));
      if (diff < minDiff) {
        minDiff = diff;
        closestDate = this.eventDates[i];
      }
    }
    this.selectedDate = closestDate;
  }

  onDateChange() {
    this.checkSessionStorage();
  }

  checkSessionStorage() {
    const sessionKey = `${this.eventId}-${this.selectedDate}`;
    this.isCheckedIn = !!sessionStorage.getItem(sessionKey);
  }

  async checkIn() {
    if (this.isCheckedIn || !this.selectedDate) return;

    await this.firestoreService.addAttendance(this.eventId!, this.selectedDate, { name: this.name });
    const sessionKey = `${this.eventId}-${this.selectedDate}`;
    sessionStorage.setItem(sessionKey, 'true');
    this.isCheckedIn = true;
  }
}
