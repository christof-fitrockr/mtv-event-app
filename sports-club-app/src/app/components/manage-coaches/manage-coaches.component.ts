import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';

interface Coach {
  id?: string;
  name: string;
  email: string;
  bio: string;
}

@Component({
  selector: 'app-manage-coaches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-coaches.component.html',
  styleUrls: ['./manage-coaches.component.css']
})
export class ManageCoachesComponent implements OnInit {
  coaches: Coach[] = [];
  newCoach: Coach = { name: '', email: '', bio: '' };
  editingCoach: Coach | null = null;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.firestoreService.getCoaches().subscribe((coaches: Coach[]) => {
      this.coaches = coaches;
    });
  }

  addCoach(): void {
    this.firestoreService.addCoach(this.newCoach);
    this.newCoach = { name: '', email: '', bio: '' };
  }

  editCoach(coach: Coach): void {
    this.editingCoach = { ...coach };
  }

  updateCoach(): void {
    if (this.editingCoach) {
      this.firestoreService.updateCoach(this.editingCoach);
      this.editingCoach = null;
    }
  }

  deleteCoach(id: string): void {
    this.firestoreService.deleteCoach(id);
  }
}
