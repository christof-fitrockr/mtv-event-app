import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FirestoreService, Event, Location, Coach } from '../../services/firestore.service';
import { Observable, of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { QrCodeComponent } from 'ng-qrcode';
import { MarkdownModule } from 'ngx-markdown';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-event-public-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, QrCodeComponent, MarkdownModule, LeafletModule],
  templateUrl: './event-public-detail.component.html',
  styleUrls: ['./event-public-detail.component.css']
})
export class EventPublicDetailComponent implements OnInit {
  event$: Observable<Event | null> = of(null);
  location$: Observable<Location | null> = of(null);
  coaches$: Observable<Coach[]> = of([]);
  qrCodeData$: Observable<string> = of('');

  // Leaflet properties
  leafletOptions: L.MapOptions = {};
  leafletLayers: L.Layer[] = [];

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit(): void {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.firestoreService.getEvent(id);
        } else {
          return of(null);
        }
      }),
      map(event => {
        if (event && !event.schedule) {
          event.schedule = [];
        }
        return event;
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
      if (location && location.latitude && location.longitude) {
        this.leafletOptions = {
          layers: [
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            })
          ],
          zoom: 15,
          center: L.latLng(location.latitude, location.longitude)
        };
        this.leafletLayers = [
          L.marker([location.latitude, location.longitude], {
            icon: L.icon({
              iconSize: [25, 41],
              iconAnchor: [13, 41],
              iconUrl: 'assets/marker-icon.png',
              shadowUrl: 'assets/marker-shadow.png'
            })
          })
        ];
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
