import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../core-ui/material/material.module';

import { SharedModule } from '../wallet/shared/shared.module';
import { WalletModule } from '../wallet/wallet/wallet.module';

import { GuidelineComponent } from './guideline.component';
import { GuidelineIconsComponent } from './tabs/guideline-icons/guideline-icons.component';
import { GuidelineModalsComponent } from './tabs/guideline-modals/guideline-modals.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    WalletModule
  ],
  declarations: [GuidelineComponent, GuidelineIconsComponent, GuidelineModalsComponent],
  exports: [ CommonModule ]
})
export class GuidelineModule { }
