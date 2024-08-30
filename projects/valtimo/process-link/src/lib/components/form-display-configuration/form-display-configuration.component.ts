import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {FormDisplayType, FormSize} from '../../models';
import {TranslateService} from '@ngx-translate/core';
import {ProcessLinkStateService} from '../../services';
import {ListItem} from 'carbon-components-angular';
import {map} from 'rxjs/operators';

@Component({
  selector: 'valtimo-form-display-configuration',
  templateUrl: './form-display-configuration.component.html',
})
export class FormDisplayConfigurationComponent implements OnDestroy {
  @Output() formDisplayValue = new EventEmitter<string>();
  @Output() formSizeValue = new EventEmitter<string>();

  public formDisplayValue$ = new BehaviorSubject<FormDisplayType | null>(null);
  public formSizeValue$ = new BehaviorSubject<FormSize | null>(null);

  private readonly _DISPLAY_TYPE_OPTIONS: FormDisplayType[] = ['modal', 'panel'];
  private readonly _FORM_SIZE_OPTIONS: FormSize[] = ['extraSmall', 'small', 'medium', 'large'];
  private readonly _subscriptions = new Subscription();

  public readonly formDisplayTypeListItems$: Observable<ListItem[]> = combineLatest([
    this.formDisplayValue$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([formDisplayValue]) =>
      this._DISPLAY_TYPE_OPTIONS.map(key => ({
        content: this.translateService.instant(`processLinkSteps.displayType.options.${key}`),
        key: key,
        selected: this.formDisplayValue$.getValue() === key,
      }))
    )
  );

  public readonly formSizeListItems$: Observable<ListItem[]> = combineLatest([
    this.formSizeValue$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([formDisplayValue]) =>
      this._FORM_SIZE_OPTIONS.map(key => ({
        content: this.translateService.instant(`processLinkSteps.formSize.options.${key}`),
        key: key,
        selected: this.formSizeValue$.getValue() === key,
      }))
    )
  );

  constructor(
    private readonly stateService: ProcessLinkStateService,
    private readonly translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this._subscriptions.add(
      this.stateService.selectedProcessLink$.subscribe(selectedProcessLink => {
        if (selectedProcessLink) {
          this.formDisplayValue$.next(selectedProcessLink.formDisplayType);
          this.formSizeValue$.next(selectedProcessLink.formSize);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public selectFormDisplayType(event): void {
    if (event.key) {
      this.formDisplayValue$.next(event.key);
      this.formDisplayValue.emit(event.key);
    } else {
      this.formDisplayValue$.next(null);
    }
  }

  public selectFormSize(event): void {
    if (event.key) {
      this.formSizeValue$.next(event.key);
      this.formSizeValue.emit(event.key);
    } else {
      this.formSizeValue$.next(null);
    }
  }
}
