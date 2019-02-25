import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';
import { environment } from 'environments/environment';

import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { BlockStatusService } from 'app/core/rpc/blockstatus/blockstatus.service';
// modals
import { UnlockwalletComponent } from 'app/modals/unlockwallet/unlockwallet.component';
import { UnlockModalConfig } from './models/unlock.modal.config.interface';
import { ListingExpiryConfig } from './models/listingExpiry.modal.config.interface';
import { ColdstakeComponent } from 'app/modals/coldstake/coldstake.component';
import { SyncingComponent } from 'app/modals/syncing/syncing.component';
import { EncryptwalletComponent } from 'app/modals/encryptwallet/encryptwallet.component';
import { CreateWalletComponent } from 'app/modals/createwallet/createwallet.component';
import { ListingExpirationComponent } from 'app/modals/market-listing-expiration/listing-expiration.component';
import { TermsComponent } from 'app/modals/terms/terms.component';
import { termsObj } from 'app/modals/terms/terms-txt';

interface ModalsSettings {
  disableClose: boolean;
}

@Injectable()
export class ModalsHelperService implements OnDestroy {

  private log: any = Log.create('modals.service');
  private destroyed: boolean = false;

  // @TODO replace ModalsHelperService with ModalsService.
  private progress: Subject<Number> = new Subject<Number>();

  /* True if user already has a wallet (imported seed or created wallet) */
  public initializedWallet: boolean = false;
  private _createModalOpen: boolean = false;

  private modelSettings: ModalsSettings = {
    disableClose: true
  };

  constructor (
    private _rpcState: RpcStateService,
    private _blockStatusService: BlockStatusService,
    private _dialog: MatDialog
  ) {

    /* Hook BlockStatus -> open syncing modal only once */
    this._blockStatusService.statusUpdates.asObservable().take(1).subscribe(status => {
      // Hiding the sync modal initially
      // this.openSyncModal(status);
    });

    /* Hook BlockStatus -> update % `progress` */
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
    });

    /* Hook for checking the accept & terms modal */
    if (!environment.isTesting) {
      this.checkForNewVersion();
    }
  }

  /**
    * Unlock wallet
    * @param {UnlockModalConfig} data       Optional - data to pass through to the modal.
    */

  unlock(data: UnlockModalConfig, callback?: Function, cancelcallback?: Function, cancelOnSuccess: boolean = true) {
    if (this._rpcState.get('locked')) {
      const dialogRef = this._dialog.open(UnlockwalletComponent, this.modelSettings);
      if (data || callback) {
        dialogRef.componentInstance.setData(data, callback);
      }
      dialogRef.afterClosed().subscribe(() => {
        if (cancelcallback) {
          const isLocked = this._rpcState.get('locked');
          if (isLocked || cancelOnSuccess) {
            cancelcallback();
          }
        }
        this.log.d('unlock modal closed');
      });
    } else if (callback) {
      callback();
    }
  }

    /**
    * coldStack
    * @param {string} type       type contains type of the modal.
    */

  coldStake(type: string) {
    const dialogRef = this._dialog.open(ColdstakeComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('coldStack modal closed');
    });
  }

  syncing() {
    const dialogRef = this._dialog.open(SyncingComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('syncing modal closed');
    });
  }

  createWallet(initialWallet?: boolean) {
    const settings = {
      ...this.modelSettings,
      data: {
        initialWallet
      }
    }
    this._createModalOpen = true;
    const dialogRef = this._dialog.open(CreateWalletComponent, settings);
    dialogRef.afterClosed().subscribe(() => {
      this._createModalOpen = false;
      this.log.d('createWallet modal closed');
    });
  }

  encrypt() {
    const dialogRef = this._dialog.open(EncryptwalletComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('encrypt modal closed');
    });
  }

  /**
    * Open the Createwallet modal if wallet is not initialized
    */

  openInitialCreateWallet(): void {
    this._rpcState.observe('ui:walletInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(
        state => {
          this.initializedWallet = state;
          if (state) {
            this.log.i('Wallet already initialized.');
            return;
          }
          if (this._createModalOpen) {
            return;
          }

          this.createWallet(true);
        });
  }

  /**
    * Open the Sync modal if it needs to be opened
    * @param {any} status  Blockchain status
    */
  openSyncModal(status: any): void {
    // Open syncing Modal
    if ((status.networkBH <= 0
      || status.internalBH <= 0
      || status.networkBH - status.internalBH > 50)) {
        this.syncing();
    }
  }

  openListingExpiryModal(data: ListingExpiryConfig, callback: Function): void {
    const dialogRef = this._dialog.open(ListingExpirationComponent, this.modelSettings);
    dialogRef.componentInstance.setData(data, callback);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('listing exiry modal closed');
    });
  }

  /**
    * Open the accept & terms modal if it wasn't accepted before
    */
  checkForNewVersion() {
    if (!this.getVersion() || (this.getVersion() && this.getVersion().createdAt !== termsObj.createdAt
      && this.getVersion().text !== termsObj.text)) {
      const dialogRef = this._dialog.open(TermsComponent, this.modelSettings)
      dialogRef.componentInstance.text = termsObj.text;
      dialogRef.afterClosed().subscribe(() => {
        this.setVersion();
        /* Hook wallet initialized -> open createwallet modal */
        this.openInitialCreateWallet();
      });
    } else {
      this.openInitialCreateWallet();
    }
  }

  getVersion(): any {
    return JSON.parse(localStorage.getItem('terms'));
  }

  setVersion() {
    localStorage.setItem('terms', JSON.stringify(termsObj));
  }

  /** Get progress set by block status */
  getProgress() {
    return (this.progress.asObservable());
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
