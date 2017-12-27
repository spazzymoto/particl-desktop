import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../core-ui/material/material.module';

import { GuidelineComponent } from './guideline.component';
import { GuidelineIconsComponent } from './tabs/guideline-icons/guideline-icons.component';
import { EscapeHtmlPipePipe } from './escape-html-pipe.pipe';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [GuidelineComponent, GuidelineIconsComponent, EscapeHtmlPipePipe ],
  exports: [ CommonModule ]
})
export class GuidelineModule { }
