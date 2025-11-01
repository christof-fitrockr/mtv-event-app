import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CheckInComponent } from './components/check-in/check-in.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { ManageLocationsComponent } from './components/manage-locations/manage-locations.component';
import { ManageEventsComponent } from './components/manage-events/manage-events.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'manage-locations', component: ManageLocationsComponent, canActivate: [authGuard] },
  { path: 'manage-events', component: ManageEventsComponent, canActivate: [authGuard] },
  { path: 'checkin/:eventId', component: CheckInComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
