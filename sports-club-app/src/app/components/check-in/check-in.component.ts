import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { FirestoreService } from '../../services/firestore.service';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent {
  scannerEnabled = true;
  successMessage = '';
  errorMessage = '';
  allowedFormats = [BarcodeFormat.QR_CODE];

  constructor(private firestoreService: FirestoreService) { }

  async onScanSuccess(result: string): Promise<void> {
    this.scannerEnabled = false;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const data = JSON.parse(result);
      if (data.eventId && data.participantId) {
        await this.firestoreService.checkInParticipant(data.eventId, data.participantId);
        const event = await this.firestoreService.getEvent(data.eventId);
        const participant = event.participants.find((p: any) => p.id === data.participantId);
        this.successMessage = `Successfully checked in ${participant?.name}!`;
      } else {
        this.errorMessage = 'Invalid QR code.';
      }
    } catch (error) {
      this.errorMessage = 'Error processing QR code.';
      console.error(error);
    }

    setTimeout(() => {
      this.scannerEnabled = true;
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000); // Re-enable scanner after 5 seconds
  }
}
