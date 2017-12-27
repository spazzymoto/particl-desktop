import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../core-ui/material/material.module';

import { GuidelineComponent } from './guideline.component';
import { GuidelineIconsComponent } from './tabs/guideline-icons/guideline-icons.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [GuidelineComponent, GuidelineIconsComponent],
  exports: [ CommonModule ]
})
export class GuidelineModule { }
