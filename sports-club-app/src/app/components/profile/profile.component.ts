import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: any = { displayName: '', email: '' };

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { displayName: currentUser.displayName, email: currentUser.email };
    }
  }

  async updateProfile() {
    await this.authService.updateProfile(this.user.displayName);
    alert('Profile updated successfully!');
  }

  async sendPasswordReset() {
    await this.authService.sendPasswordResetEmail(this.user.email);
    alert('Password reset email sent!');
  }
}
