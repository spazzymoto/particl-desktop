import { Component, OnDestroy } from '@angular/core';

import { MultiwalletService, IWallet } from './multiwallet.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals-helper.service';

@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnDestroy {
  private log: any = Log.create(
    'multiwallet-sidebar.component id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private destroyed: boolean = false;

  public list: Array<IWallet> = [];
  public activeWallet: IWallet;

  constructor(
    private _modals: ModalsHelperService,
    private _rpc: RpcService,
    private multi: MultiwalletService
  ) {
    // get wallet list
    this.multi.list.takeWhile(() => !this.destroyed).subscribe(list => {
      this.list = list;
    });
  }

  isWalletActive(w: IWallet): boolean {
    return this._rpc.wallet === w.name;
  }

  async switchToWallet(wallet: IWallet) {
    this.log.d('setting wallet to ', wallet);

    await this._rpc.call('listwallets', [])
    .subscribe(
      walletList => {
        if (walletList.includes(wallet.name)) {
          // Wallet is already loaded, so just requires switching to it
          this.reload(wallet.name);
        } else {
          // load the wallet, even possible with the wrong active rpc.
          this._rpc.call('loadwallet', [wallet.name])
          .subscribe(w => {
            this.reload(wallet.name);
          });
        }
      },
      error => this.log.er('failed loading wallet', error)
    );
  }

  private reload(walletName: string) {
    this._rpc.wallet = walletName;
    window.location.pathname = '/wallet/overview';
  }

  public createWallet() {
    this._modals.createWallet(false);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
