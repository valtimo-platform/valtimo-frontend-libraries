import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {
  CARBON_CONSTANTS,
  SelectItem,
  SelectModule,
  ValtimoCdsModalDirective,
} from '@valtimo/components';
import {ButtonModule, IconModule, InputModule, ModalModule} from 'carbon-components-angular';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  PropertyField,
  IkoDataAggregateResponse,
  IkoRepositoryConfigResponse,
} from '../../../models';
import {IkoManagementApiService} from '../../../services';
import {PropertiesFormComponent} from '../../iko-management-properties/iko-management-properties.component';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'valtimo-iko-management-view-modal',
  templateUrl: './iko-management-repository-modal.component.html',
  styleUrl: './iko-management-repository-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ValtimoCdsModalDirective,
    InputModule,
    ReactiveFormsModule,
    ButtonModule,
    IconModule,
    PropertiesFormComponent,
    SelectModule,
  ],
})
export class IkoManagementRepositoryModalComponent {
  private readonly _open$ = new BehaviorSubject<boolean>(false);
  @Input() public set open(value: boolean) {
    this._open$.next(value);

    if (!value) this.resetForm();
  }
  public get open$(): Observable<boolean> {
    return this._open$.asObservable();
  }
  private readonly _apiKey$ = new BehaviorSubject<string | null>(null);
  @Input() public set apiKey(value: string | null) {
    if (!value) return;

    this._apiKey$.next(value);
  }
  public readonly $prefillData = signal<IkoDataAggregateResponse | null>(null);
  @Input() public set prefillData(value: IkoDataAggregateResponse | null) {
    this.$prefillData.set(value);
    if (!value) return;

    this.formGroup.get('key')?.disable();
  }
  @Output() public readonly modalClose = new EventEmitter<any | null>();

  public readonly disabled$ = new BehaviorSubject(true);
  private readonly _ikoRepositoryTypes$ = this.ikoManagementApiService.getIkoRepositoryTypes();
  public readonly ikoRepositoryTypeSelectItems$: Observable<SelectItem[]> =
    this._ikoRepositoryTypes$.pipe(
      map(types => Object.keys(types).map(typeKey => ({id: typeKey, text: types[typeKey]}))),
      tap(() => {
        this.disabled$.next(false);
      })
    );

  public readonly propertyFields$: Observable<PropertyField[]> = this.open$.pipe(
    filter((open: boolean) => !!open),
    switchMap(() => this._apiKey$),
    switchMap((repositoryKey: string | null) =>
      this.ikoManagementApiService.getIkoDataAggregateType(repositoryKey ?? '')
    ),
    switchMap((repository: IkoRepositoryConfigResponse) =>
      this.ikoManagementApiService.getIkoRepositoryPropertyFields(repository.type)
    )
  );
  public formGroup = this.fb.group({
    title: this.fb.control('', Validators.required),
    key: this.fb.control('', Validators.required),
    type: this.fb.control('iko', [Validators.required]),
    properties: this.fb.group({}, Validators.required),
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly ikoManagementApiService: IkoManagementApiService
  ) {}

  public get properties(): FormGroup | null {
    const properties = this.formGroup.get('properties');
    return !properties ? null : (properties as FormGroup);
  }

  public onCancel(): void {
    this.modalClose.emit(null);
  }

  public onSave(): void {
    this.modalClose.emit(this.formGroup.getRawValue());
  }

  public getControlInvalid(controlKey: string): boolean {
    const control: AbstractControl | null = this.formGroup.get(controlKey);

    if (!control) {
      return true;
    }

    return !control.valid && !control.pristine;
  }

  private resetForm(): void {
    setTimeout(() => {
      this.formGroup.reset({
        title: '',
        key: '',
      });
      this.formGroup.setControl('properties', this.fb.group({}, Validators.required));
      this.formGroup.get('key')?.enable();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }
}
