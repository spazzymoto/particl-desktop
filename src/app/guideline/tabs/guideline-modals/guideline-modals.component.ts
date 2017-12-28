import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationModalComponent } from '../../../wallet/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { QrCodeModalComponent } from '../../../wallet/wallet/shared/qr-code-modal/qr-code-modal.component';
import { AddressLookupComponent } from '../../../wallet/wallet/addresslookup/addresslookup.component';
import {AddressLookUpCopy} from "../../../wallet/wallet/models/address-look-up-copy";
import {SnackbarService} from "../../../core/snackbar/snackbar.service";

@Component({
  selector: 'app-guideline-modals',
  templateUrl: './guideline-modals.component.html',
  styleUrls: ['./guideline-modals.component.scss']
})
export class GuidelineModalsComponent implements OnInit {

  constructor(private dialog: MatDialog,
              private snackbar: SnackbarService) {
  }

  ngOnInit() {
  }

  openDeleteConfirmationModal() {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent);
    dialogRef.componentInstance.dialogContent = 'This Item will no more available after Delete ?';
    dialogRef.componentInstance.onDelete.subscribe(() => {
      this.snackbar.open('Item Deleted !!')
    });
  }

  opeQrCodeModal() {
    const dialogRef = this.dialog.open(QrCodeModalComponent);
    dialogRef.componentInstance.singleAddress.label = 'Label Name goes here';
    dialogRef.componentInstance.singleAddress.address = 'pitjQ8UH1qrULAkBHWmemdb1f8zu3CVDcU';
  }

  openAddressLookup() {
    const dialogRef = this.dialog.open(AddressLookupComponent);
    dialogRef.componentInstance.selectAddressCallback.subscribe((response: AddressLookUpCopy) => {
      this.snackbar.open(`This Address ${response.address} is selected`);
      dialogRef.close();
    });
  }
}
