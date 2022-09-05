import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTypeComponent } from './object-type.component';

describe('ObjectTypeComponent', () => {
  let component: ObjectTypeComponent;
  let fixture: ComponentFixture<ObjectTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
