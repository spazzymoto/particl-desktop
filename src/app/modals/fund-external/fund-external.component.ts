import { Component, Inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RpcService } from 'app/core/core.module';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Amount } from 'app/core/util/utils';

@Component({
  selector: 'app-fund-external',
  templateUrl: './fund-external.component.html',
  styleUrls: ['./fund-external.component.scss']
})
export class FundExternalModalComponent implements OnInit, OnDestroy {
  public amount: Amount;
  public address: string = '';
  public isConfirming: boolean = false;
  private checkAddress$: Subscription;
  private TRANSACTION_FEE: number = 0.0002;
  private cartAmount: number;

  @Output() isFunded: EventEmitter<string> = new EventEmitter();

  constructor(
    private rpc: RpcService,
    private dialogRef: MatDialogRef<FundExternalModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.cartAmount = data.cart.getTotal().getAmount() + this.TRANSACTION_FEE;

    this.amount = new Amount(this.cartAmount);
  }

  ngOnInit() {
    this.rpc.call('getnewaddress', ['(No label)'])
      .subscribe(response => {
        this.address = response;

        const source = interval(5000);
        this.checkAddress$ = source.pipe(
          switchMap(() => this.rpc.call('getreceivedbyaddress', [this.address, 0]))
        ).subscribe(val => {
          this.amount = new Amount(this.cartAmount - val);

          // The total has been fully funded, lets check confirmations
          if (this.amount.getAmount() <= 0) {
            this.isConfirming = true;
            this.dialogRef.disableClose = true;
            this.checkAddress$.unsubscribe();

            this.checkAddress$ = source.pipe(
              switchMap(() => this.rpc.call('getreceivedbyaddress', [this.address, 1]))
            ).subscribe(confirmedAmount => {
              if (confirmedAmount >= this.cartAmount) {
                this.isFunded.emit(this.address);
                this.dialogRef.close();
              }
            });
          }
        });
      });
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.checkAddress$.unsubscribe();
  }
}
