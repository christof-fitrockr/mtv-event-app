import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CheckInComponent } from './components/check-in/check-in.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { CoachListComponent } from './components/coach-list/coach-list.component';
import { CoachEditComponent } from './components/coach-edit/coach-edit.component';
import { LocationListComponent } from './components/location-list/location-list.component';
import { LocationEditComponent } from './components/location-edit/location-edit.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventEditComponent } from './components/event-edit/event-edit.component';
import { EventPublicDetailComponent } from './components/event-public-detail/event-public-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'coaches', component: CoachListComponent },
      { path: 'coaches/new', component: CoachEditComponent },
      { path: 'coaches/edit/:id', component: CoachEditComponent },
      { path: 'locations', component: LocationListComponent },
      { path: 'locations/new', component: LocationEditComponent },
      { path: 'locations/edit/:id', component: LocationEditComponent },
      { path: 'events', component: EventListComponent },
      { path: 'events/new', component: EventEditComponent },
      { path: 'events/edit/:id', component: EventEditComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [authGuard] },
  { path: 'checkin/:eventId', component: CheckInComponent },
  { path: 'events/:id', component: EventPublicDetailComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
