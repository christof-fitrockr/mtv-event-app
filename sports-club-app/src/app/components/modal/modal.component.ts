import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeComponent } from 'ng-qrcode';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, QrCodeComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() contentType: 'text' | 'qr' = 'text';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
