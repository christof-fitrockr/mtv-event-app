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

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  async loadStatistics() {
    this.statistics = await this.firestoreService.getEventStatistics();
  }
}
