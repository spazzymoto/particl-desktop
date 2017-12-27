import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidelineIconsComponent } from './guideline-icons.component';

describe('GuidelineIconsComponent', () => {
  let component: GuidelineIconsComponent;
  let fixture: ComponentFixture<GuidelineIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidelineIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidelineIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
