import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ValtimoCdsModalDirectiveModule, WidgetModule} from '@valtimo/components';
import {getCaseManagementRouteParams} from '@valtimo/shared';
import {
  ButtonModule,
  InputModule,
  LayerModule,
  ModalModule,
  TilesModule,
} from 'carbon-components-angular';
import {combineLatest, of, switchMap, tap} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {CreateFormDefinitionRequest} from '../../models';
import {FormManagementService} from '../../services';
import {getContextObservable} from '../../utils';
import {noDuplicateFormValidator} from '../../validators/no-duplicate-form.validator';

@Component({
  selector: 'valtimo-form-management-create',
  templateUrl: './form-management-create.component.html',
  styleUrls: ['./form-management-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputModule,
    WidgetModule,
    InputModule,
    TilesModule,
    LayerModule,
    ModalModule,
    ValtimoCdsModalDirectiveModule,
    ButtonModule,
  ],
})
export class FormManagementCreateComponent implements OnInit {
  @Input() public readonly upload = false;

  @Output() public readonly goBackEvent = new EventEmitter<void>();
  @Output() public readonly afterCreateEvent = new EventEmitter<string>();
  @Output() public readonly afterUploadEvent = new EventEmitter<string>();

  public readonly context$ = getContextObservable(this.route);

  public readonly caseManagementRouteParams$ = this.context$.pipe(
    filter(context => context === 'case'),
    switchMap(() => getCaseManagementRouteParams(this.route))
  );

  public form: FormGroup;

  constructor(
    private readonly formManagementService: FormManagementService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    combineLatest([this.context$, this.caseManagementRouteParams$])
      .pipe(
        take(1),
        tap(([context, caseManagementParams]) => {
          this.form = this.formBuilder.group({
            name: new FormControl('', Validators.required, [
              noDuplicateFormValidator(context, caseManagementParams, this.formManagementService),
            ]),
          });
        })
      )
      .subscribe();
  }

  public get formControls(): FormGroup['controls'] {
    return this.form?.controls;
  }

  public onBackButtonClick(): void {
    this.goBackEvent.emit();
  }

  public reset(): void {
    this.form.setValue({name: ''});
  }

  public onCloseEvent(): void {
    this.goBackEvent.emit();
  }

  public createFormDefinition(): void {
    const emptyForm = {display: 'form', components: []};
    const request: CreateFormDefinitionRequest = {
      name: this.form.value.name,
      formDefinition: JSON.stringify(emptyForm),
    };

    combineLatest([this.context$, this.caseManagementRouteParams$])
      .pipe(
        switchMap(([context, caseManagementParams]) =>
          context === 'case'
            ? this.formManagementService.createFormDefinitionsCase(
                caseManagementParams.caseDefinitionKey,
                caseManagementParams.caseDefinitionVersionTag,
                request
              )
            : this.formManagementService.createFormDefinition(request)
        ),
        tap(formDefinition => {
          if (this.upload) {
            this.afterUploadEvent.emit(formDefinition.id);
          } else {
            this.afterCreateEvent.emit(formDefinition.id);
          }
        })
      )
      .subscribe();
  }
}
