import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-manage-coaches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-coaches.component.html',
  styleUrls: ['./manage-coaches.css']
})
export class ManageCoachesComponent implements OnInit {
  coaches: any[] = [];
  coach: any = { name: '', email: '', bio: '', contact: '' };
  showForm = false;
  editingCoach = false;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.loadCoaches();
  }

  async loadCoaches() {
    this.coaches = await this.firestoreService.getCoaches();
  }

  showAddForm() {
    this.showForm = true;
    this.editingCoach = false;
    this.coach = { name: '', email: '', bio: '', contact: '' };
  }

  editCoach(c: any) {
    this.showForm = true;
    this.editingCoach = true;
    this.coach = { ...c };
  }

  cancel() {
    this.showForm = false;
  }

  async saveCoach() {
    if (this.editingCoach) {
      await this.firestoreService.updateCoach(this.coach.id, this.coach);
    } else {
      await this.firestoreService.addCoach(this.coach);
    }
    this.loadCoaches();
    this.showForm = false;
  }

  async deleteCoach(id: string) {
    await this.firestoreService.deleteCoach(id);
    this.loadCoaches();
  }
}
