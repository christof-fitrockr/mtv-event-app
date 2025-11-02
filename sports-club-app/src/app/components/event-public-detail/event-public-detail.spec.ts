import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPublicDetail } from './event-public-detail';

describe('EventPublicDetail', () => {
  let component: EventPublicDetail;
  let fixture: ComponentFixture<EventPublicDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPublicDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventPublicDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
