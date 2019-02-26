import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { RpcService, RpcStateService } from '../../core/core.module';
import { NewTxNotifierService } from 'app/core/rpc/rpc.module';
import { UpdaterService } from 'app/core/updater/updater.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { ProposalsNotificationsService } from 'app/core/market/proposals-notifier/proposals-notifications.service';
import { UserMessageService } from 'app/core/market/user-messages/user-message.service';
import { AlphaMainnetWarningComponent } from 'app/modals/alpha-mainnet-warning/alpha-mainnet-warning.component';
import { UserMessage, UserMessageType } from 'app/core/market/user-messages/user-message.model'
import { isPrerelease, isMainnetRelease } from 'app/core/util/utils';
import { MarketService } from 'app/core/market/market.service';

/*
 * The MainView is basically:
 * sidebar + router-outlet.
 * Will display the _main_ sidebar (not wallet picker)
 * and display wallet + market views.
 */
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit, OnDestroy {

  log: any = Log.create('main-view.component');
  private destroyed: boolean = false;

  /* UI States */

  title: string = '';
  testnet: boolean = false;
  /* errors */
  walletInitialized: boolean = undefined;
  daemonRunning: boolean = undefined;
  daemonError: any;
  /* version */
  daemonVersion: string;
  unSubscribeTimer: any;
  time: string = '5:00';
  showAnnouncements: boolean = false;
  public unlocked_until: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _rpc: RpcService,
    private _updater: UpdaterService,
    private _rpcState: RpcStateService,
    private _modalsService: ModalsHelperService,
    private dialog: MatDialog,
    private messagesService: UserMessageService,
    // the following imports are just 'hooks' to
    // get the singleton up and running
    private _newtxnotifier: NewTxNotifierService,
    public proposalsNotificationsService: ProposalsNotificationsService,
    private market: MarketService
  ) { }

  ngOnInit() {
    // Change the header title derived from route data
    // Source: https://toddmotto.com/dynamic-page-titles-angular-2-router-events
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this._route)
      .map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .flatMap(route => route.data)
      .subscribe(data => this.title = data['title']);


    /* errors */
    // Updates the error box in the sidenav whenever a stateCall returns an error.
    this._rpcState.errorsStateCall.asObservable()
      .distinctUntilChanged()
      .subscribe(update => {
        // if error exists & != false
        if (update.error) {
          this.daemonRunning = ![0, 502].includes(update.error.status);
          this.daemonError = update.error;
          this.log.d(update.error);
        } else {
          this.daemonRunning = true;
        }
      });

    // Updates the error box in the sidenav if wallet is not initialized.
    this._rpcState.observe('ui:walletInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this.walletInitialized = status;

        // There probably is a better place to do this, Arnold?
        if (this.walletInitialized && !this.market.isMarketStarted && this._rpc.wallet === 'Market') {
          this.market.startMarket();
        }
      });

    this._rpcState.observe('getwalletinfo', 'unlocked_until')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this.unlocked_until = status;
        if (this.unlocked_until > 0) {
          this.checkTimeDiff(status);
        } else {
          if (this.unSubscribeTimer) {
            this.unSubscribeTimer.unsubscribe();
          }
        }
      });

    /* versions */
    // Obtains the current daemon version
    this._rpcState.observe('getnetworkinfo', 'subversion')
      .takeWhile(() => !this.destroyed)
      .subscribe(subversion => this.daemonVersion = subversion.match(/\d+\.\d+.\d+.\d+/)[0]);

    /* check if testnet -> block explorer url */
    this._rpcState.observe('getblockchaininfo', 'chain').take(1)
      .subscribe(chain => this.testnet = chain === 'test');

    this.messagesService.message.subscribe((message) => {
      if (message) {
        this.showAnnouncements = true;
      }
    });

    // TODO - find better location to perform this check...
    if (isMainnetRelease() && isPrerelease()) {
      const alphaMessage = {
        text: 'The Particl Marketplace alpha is still in development and not 100% private yet - use it at your own risk!',
        dismissable: false,
        timeout: 0,
        messageType: UserMessageType.ALERT,
        action: () => { this.dialog.open(AlphaMainnetWarningComponent); },
        actionLabel: 'Click here to read all the details first!'
      } as UserMessage;
      this.messagesService.addMessage(alphaMessage);
    }

  }

  ngOnDestroy() {
    this.destroyed = true;
  }
  /** Open createwallet modal when clicking on error in sidenav */
  createWallet() {
    this._modalsService.createWallet();
  }

  /** Open syncingdialog modal when clicking on progresbar in sidenav */
  syncScreen() {
    this._modalsService.syncing();
  }

  checkTimeDiff(time: number) {
    const currentUtcTimeStamp = Math.floor((new Date()).getTime() / 1000);
    const diff = Math.floor(time - currentUtcTimeStamp);
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const sec = Math.ceil((diff % (60 * 60) % 60));
    this.startTimer(minutes, sec);
  }

  startTimer(min: number, sec: number): void {
    sec = this.checkSecond(sec);
    if (sec === 59) {
      min = min - 1;
    }
    if (min >= 0 && sec >= 0) {
      this.time = min + ':' + ('0' + sec).slice(-2);
      this.unSubscribeTimer = Observable.timer(1000).
        subscribe(() => this.startTimer(min, sec));
    } else {
      this.unSubscribeTimer.unsubscribe();
    }
  }

  checkSecond(sec: number): number {
    sec = sec > 0 ? (sec - 1) : 59;
    return sec;
  }

  // Paste Event Handle
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.metaKey && event.keyCode === 86 && navigator.platform.indexOf('Mac') > -1) {
      document.execCommand('Paste');
      event.preventDefault();
    }
  }

  /**
  // Sample code for open modal box
  openDemonConnectionModal() {
    const dialogRef = this.dialog.open(DaemonConnectionComponent);
    dialogRef.componentInstance.text = "Test";
  }*/
}
