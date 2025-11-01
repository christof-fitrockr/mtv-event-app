import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  user: Observable<User | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.user;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
