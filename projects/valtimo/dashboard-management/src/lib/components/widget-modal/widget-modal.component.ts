import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, Subscription} from 'rxjs';
import {WidgetModalType} from '../../models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ListItem} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {widgetChartTypesMock, widgetDataSourcesMock} from '../../mocks';

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

  private readonly _dataSourceItems$ = new BehaviorSubject<Array<string>>([]);
  public readonly dataSourceItems$: Observable<Array<ListItem>> = combineLatest([
    this._dataSourceItems$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([dataSourceItems]) =>
      dataSourceItems.map(mockItem => ({content: mockItem, selected: false}))
    )
  );
  private readonly _chartTypeItems$ = new BehaviorSubject<Array<string>>([]);
  public readonly chartTypeItems$: Observable<Array<ListItem>> = combineLatest([
    this._dataSourceItems$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([chartTypeItems]) =>
      chartTypeItems.map(mockItem => ({content: mockItem, selected: false}))
    )
  );
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
  get chartType() {
    return this.form.get('chartType');
  }

  get dataSourceField() {
    return this.form.get('dataSourceField');
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.setDropdownData();
    this.openOpenSubscription();
    this.setForm();
  }

  ngOnDestroy(): void {
    this._openSubscription?.unsubscribe();
  }

  closeModal(): void {
    this.open$.next(false);
    this.form.reset();
    this.setDropdownData();
  }

  save(): void {}

  delete(): void {}

  dataSourceSelected(dataSource: any): void {
    this.dataSource.setValue(dataSource?.item?.content);
  }

  chartTypeSelected(chartType: any): void {
    this.dataSource.setValue(chartType?.item?.content);
  }

  copyKey(): void {}

  private setDropdownData(): void {
    this.setDataSourceItems();
    this.setChartTypeItems();
  }

  private setDataSourceItems(): void {
    this._dataSourceItems$.next(widgetDataSourcesMock);
  }

  private setChartTypeItems(): void {
    this._chartTypeItems$.next(widgetChartTypesMock);
  }

  private setForm(): void {
    this.form = this.fb.group({
      title: this.fb.control(''),
      key: this.fb.control('', [Validators.required]),
      dataSource: this.fb.control('', [Validators.required]),
      chartType: this.fb.control('', [Validators.required]),
      dataSourceField: this.fb.control('', [Validators.required]),
    });

    this.form.get('key').setValue('test-key');
    this.form.get('key').disable();
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
