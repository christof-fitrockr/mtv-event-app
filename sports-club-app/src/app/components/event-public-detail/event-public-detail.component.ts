import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FirestoreService, Event, Location, Coach } from '../../services/firestore.service';
import { Observable, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { QrCodeComponent } from 'ng-qrcode';
import { MarkdownModule } from 'ngx-markdown';
import { MapsModule, MapsTooltipService, MarkerService } from '@syncfusion/ej2-angular-maps';

@Component({
  selector: 'app-event-public-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, QrCodeComponent, MarkdownModule, MapsModule],
  providers: [MapsTooltipService, MarkerService],
  templateUrl: './event-public-detail.component.html',
  styleUrls: ['./event-public-detail.component.css']
})
export class EventPublicDetailComponent implements OnInit {
  event$: Observable<Event | null> = of(null);
  location$: Observable<Location | null> = of(null);
  coaches$: Observable<Coach[]> = of([]);
  qrCodeData$: Observable<string> = of('');
  public zoomSettings: object;
  public centerPosition: object;

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) {
    this.zoomSettings = {
      enable: true,
      zoomFactor: 15,
    };
    this.centerPosition = {
      latitude: 0,
      longitude: 0,
    };
  }

  ngOnInit(): void {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.firestoreService.getEvent(id);
        } else {
          return of(null);
        }
      })
    );

    this.location$ = this.event$.pipe(
      switchMap(event => {
        if (event && event.locationId) {
          return from(this.firestoreService.getLocation(event.locationId));
        } else {
          return of(null);
        }
      })
    );

    this.location$.subscribe(location => {
        if(location) {
            this.centerPosition = {
                latitude: location.latitude,
                longitude: location.longitude,
            };
        }
    });

    this.coaches$ = this.event$.pipe(
      switchMap(event => {
        if (event && event.coachIds && event.coachIds.length > 0) {
          return this.firestoreService.getCoachesByIds(event.coachIds);
        } else {
          return of([]);
        }
      })
    );

    this.qrCodeData$ = this.event$.pipe(
      switchMap(event => {
        if (event) {
          return of(`${window.location.origin}/checkin/${event.id}`);
        } else {
          return of('');
        }
      })
    );
  }
}
