import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService, Event, Participant } from '../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { QrCodeModule } from 'ng-qrcode';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, QrCodeModule],
  templateUrl: './participant-list.component.html',
  styleUrls: ['./participant-list.component.css']
})
export class ParticipantListComponent implements OnInit {
  event: Event | null = null;
  eventId: string = '';
  newParticipantName: string = '';
  numberOfStandardParticipants: number = 20;

  private standardNames = [
    'Cinderella', 'Snow White', 'Belle', 'Ariel', 'Jasmine', 'Mulan', 'Pocahontas', 'Rapunzel', 'Tiana', 'Merida',
    'Superman', 'Batman', 'Wonder Woman', 'Spider-Man', 'Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye'
  ];

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    if (this.eventId) {
      this.loadEvent();
    }
  }

  async loadEvent(): Promise<void> {
    this.event = await this.firestoreService.getEvent(this.eventId);
  }

  async addParticipant(): Promise<void> {
    if (this.newParticipantName.trim() && this.eventId) {
      await this.firestoreService.addParticipants(this.eventId, [this.newParticipantName]);
      this.newParticipantName = '';
      this.loadEvent();
    }
  }

  async updateParticipantName(participant: Participant, newName: string): Promise<void> {
    if (newName.trim() && this.eventId) {
      const updatedParticipant = { ...participant, name: newName };
      await this.firestoreService.updateParticipant(this.eventId, updatedParticipant);
      this.loadEvent();
    }
  }

  async deleteParticipant(participantId: string): Promise<void> {
    if (this.eventId) {
      await this.firestoreService.deleteParticipant(this.eventId, participantId);
      this.loadEvent();
    }
  }

  async generateStandardParticipants(): Promise<void> {
    if (this.eventId && this.numberOfStandardParticipants > 0) {
      const names = [];
      for (let i = 0; i < this.numberOfStandardParticipants; i++) {
        names.push(this.standardNames[Math.floor(Math.random() * this.standardNames.length)]);
      }
      await this.firestoreService.addParticipants(this.eventId, names);
      this.loadEvent();
    }
  }

  getQRCodeData(participant: Participant): string {
    return JSON.stringify({
      eventId: this.eventId,
      participantId: participant.id,
    });
  }

  downloadQrCode(el: HTMLCanvasElement, participantName: string): void {
    const dataUrl = el.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${participantName}-qrcode.png`;
    link.click();
  }
}
