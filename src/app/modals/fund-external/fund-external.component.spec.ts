import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';
import { MaterialModule } from '../../core-ui/material/material.module';


import { SnackbarService } from '../../core/snackbar/snackbar.service';

import { FundExternalModalComponent } from './fund-external.component';

describe('SendConfirmationModalComponent', () => {
  let component: FundExternalModalComponent;
  let fixture: ComponentFixture<FundExternalModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MaterialModule,
        MatFormFieldModule // check if this is required. If so, move into CoreUi.
      ],
      declarations: [ FundExternalModalComponent ],
      providers: [
        SnackbarService,
        { provide: MatDialogRef},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundExternalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
