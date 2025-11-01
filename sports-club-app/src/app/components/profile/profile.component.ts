import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  displayName: string = '';
  email: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.authState.subscribe(user => {
      this.user = user;
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
      }
    });
  }

  async updateProfile(): Promise<void> {
    if (this.user) {
      try {
        await this.authService.updateProfile(this.displayName, this.email);
        alert('Profile updated successfully!');
      } catch (error) {
        alert('Error updating profile.');
        console.error(error);
      }
    }
  }

  async sendPasswordReset(): Promise<void> {
    if (this.user?.email) {
      try {
        await this.authService.sendPasswordReset(this.user.email);
        alert('Password reset email sent!');
      } catch (error) {
        alert('Error sending password reset email.');
        console.error(error);
      }
    }
  }
}
