import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckInComponent } from './check-in.component';
import { FirestoreService } from '../../services/firestore.service';
import { of } from 'rxjs';

describe('CheckInComponent', () => {
  let component: CheckInComponent;
  let fixture: ComponentFixture<CheckInComponent>;
  let firestoreServiceSpy: jasmine.SpyObj<FirestoreService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FirestoreService', ['checkInParticipant', 'getEvent']);

    await TestBed.configureTestingModule({
      imports: [CheckInComponent],
      providers: [{ provide: FirestoreService, useValue: spy }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInComponent);
    component = fixture.componentInstance;
    firestoreServiceSpy = TestBed.inject.Spy.asSpyObj<FirestoreService>(FirestoreService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle successful scan', async () => {
    const eventId = 'testEvent';
    const participantId = 'testParticipant';
    const qrCodeData = JSON.stringify({ eventId, participantId });
    const mockEvent = { participants: [{ id: participantId, name: 'Test Participant' }] };

    firestoreServiceSpy.checkInParticipant.and.returnValue(Promise.resolve());
    firestoreServiceSpy.getEvent.and.returnValue(Promise.resolve(mockEvent));

    await component.onScanSuccess(qrCodeData);

    expect(firestoreServiceSpy.checkInParticipant).toHaveBeenCalledWith(eventId, participantId);
    expect(component.successMessage).toBe('Successfully checked in Test Participant!');
  });
});
