import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, map, Observable, Subscription} from 'rxjs';
import {WidgetModalType} from '../../models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ListItem} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {widgetDataSourcesMock} from '../../mocks';

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
  public readonly dataSourceItems$: Observable<Array<ListItem>> = this.translateService
    .stream('key')
    .pipe(map(() => widgetDataSourcesMock.map(mockItem => ({content: mockItem, selected: false}))));
  private _openSubscription!: Subscription;

  get title() {
    return this.form.get('title');
  }
  get key() {
    return this.form.get('key');
  }

  get dataSource() {
    return this.form.get('dataSource');
  }
  constructor(
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.openOpenSubscription();
    this.setForm();
  }

  ngOnDestroy(): void {
    this._openSubscription?.unsubscribe();
  }

  closeModal(): void {
    this.open$.next(false);
    this.form.reset();
  }

  save(): void {}

  delete(): void {}

  private setForm(): void {
    this.form = this.fb.group({
      title: this.fb.control(''),
      key: this.fb.control('', [Validators.required]),
      dataSource: this.fb.control('', [Validators.required]),
    });
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
