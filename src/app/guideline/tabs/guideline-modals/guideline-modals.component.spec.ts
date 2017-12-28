import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidelineModalsComponent } from './guideline-modals.component';

describe('GuidelineModalsComponent', () => {
  let component: GuidelineModalsComponent;
  let fixture: ComponentFixture<GuidelineModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidelineModalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidelineModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
