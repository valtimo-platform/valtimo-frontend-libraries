import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {WidgetModalType} from '../../models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'valtimo-widget-modal',
  templateUrl: './widget-modal.component.html',
  styleUrls: ['./widget-modal.component.scss'],
})
export class WidgetModalComponent implements OnInit, OnDestroy {
  @Input() showModal$: Observable<boolean>;
  @Input() type: WidgetModalType;

  public form!: FormGroup;
  public readonly open$ = new BehaviorSubject<boolean>(false);
  private _openSubscription!: Subscription;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.openOpenSubscription();
    this.setForm();
  }

  ngOnDestroy(): void {
    this._openSubscription?.unsubscribe();
  }

  closeModal(): void {
    this.open$.next(false);
  }

  save(): void {}

  delete(): void {}

  private setForm(): void {
    this.form = this.fb.group({
      title: this.fb.control(''),
      key: this.fb.control('', [Validators.required]),
    });
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
