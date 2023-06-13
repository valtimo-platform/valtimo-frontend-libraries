import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {WidgetModalType} from '../../models';

@Component({
  selector: 'valtimo-widget-modal',
  templateUrl: './widget-modal.component.html',
  styleUrls: ['./widget-modal.component.scss'],
})
export class WidgetModalComponent implements OnInit, OnDestroy {
  @Input() showModal$: Observable<boolean>;
  @Input() type: WidgetModalType;

  public readonly open$ = new BehaviorSubject<boolean>(false);

  private _openSubscription!: Subscription;

  ngOnInit(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }

  ngOnDestroy(): void {
    this._openSubscription?.unsubscribe();
  }

  closeModal(): void {
    this.open$.next(false);
  }

  save(): void {}
}
