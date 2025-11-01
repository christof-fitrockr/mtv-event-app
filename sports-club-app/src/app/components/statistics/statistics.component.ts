import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.css']
})
export class StatisticsComponent implements OnInit {
  statistics: any[] = [];
  eventInstances: any[] = [];

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadEventInstances();
  }

  async loadStatistics() {
    const events = await this.firestoreService.getAllEvents();
    const allAttendance = await this.firestoreService.getAllAttendance();

    this.statistics = events.map(event => {
      const eventAttendance = allAttendance.filter(att => att.eventId === event.id);
      const totalAttendees = eventAttendance.length;
      const numberOfInstances = new Set(eventAttendance.map(att => att.dateOfEvent)).size;
      const averageAttendees = numberOfInstances > 0 ? totalAttendees / numberOfInstances : 0;
      const averageOccupancy = event.capacity > 0 ? (averageAttendees / event.capacity) * 100 : 0;

      return {
        ...event,
        averageAttendees: averageAttendees.toFixed(2),
        averageOccupancy: averageOccupancy.toFixed(2)
      };
    });
  }

  async loadEventInstances() {
    const allAttendance = await this.firestoreService.getAllAttendance();
    const events = await this.firestoreService.getAllEvents();
    const eventMap = new Map(events.map(event => [event.id, event.title]));

    const instancesMap = new Map<string, any>();
    allAttendance.forEach(att => {
      const key = `${att.eventId}-${att.dateOfEvent}`;
      if (!instancesMap.has(key)) {
        instancesMap.set(key, {
          eventName: eventMap.get(att.eventId),
          date: att.dateOfEvent,
          checkIns: 0
        });
      }
      instancesMap.get(key).checkIns++;
    });

    this.eventInstances = Array.from(instancesMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }
}
