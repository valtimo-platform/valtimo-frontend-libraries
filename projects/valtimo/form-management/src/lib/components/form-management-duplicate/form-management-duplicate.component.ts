import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {
  BaseModal,
  ButtonModule,
  InputModule,
  LayerModule,
  ModalModule,
  ModalService,
} from 'carbon-components-angular';
import {CreateFormDefinitionRequest} from '../../models';
import {FormManagementService} from '../../services';
import {noDuplicateFormValidator} from '../../validators/no-duplicate-form.validator';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ValtimoCdsModalDirectiveModule} from '@valtimo/components';
import {getCaseManagementRouteParams, getContextObservable} from '../../utils';

@Component({
  selector: 'valtimo-form-management-duplicate-modal',
  templateUrl: './form-management-duplicate.component.html',
  styleUrls: ['./form-management-duplicate.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ButtonModule,
    InputModule,
    ReactiveFormsModule,
    FormsModule,
    LayerModule,
    ValtimoCdsModalDirectiveModule,
  ],
})
export class FormManagementDuplicateComponent extends BaseModal implements OnInit {
  public readonly context$ = getContextObservable(this.route);

  public readonly caseManagementRouteParams$ = this.context$.pipe(
    switchMap(context => getCaseManagementRouteParams(context, this.route))
  );

  public duplicateForm!: FormGroup;

  public get duplicateFormName(): FormControl {
    return this.duplicateForm.controls['duplicateFormName'] as FormControl;
  }

  public getDefaultName(): string {
    return this.formToDuplicate.name + '-duplicate';
  }

  constructor(
    @Inject('formToDuplicate') public readonly formToDuplicate,
    @Inject('disabledPendingChangesCallback') public readonly disablePendingChangesCallback,
    protected modalService: ModalService,
    protected formManagementService: FormManagementService,
    protected route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    combineLatest([this.context$, this.caseManagementRouteParams$])
      .pipe(
        take(1),
        tap(([context, caseManagementParams]) => {
          this.duplicateForm = new FormGroup({
            duplicateFormName: new FormControl(
              this.getDefaultName(),
              Validators.compose([Validators.required]),
              [noDuplicateFormValidator(context, caseManagementParams, this.formManagementService)]
            ),
          });
          this.duplicateForm.markAllAsTouched();
        })
      )
      .subscribe();
  }

  public duplicate(): void {
    const control = this.duplicateFormName;

    const request: CreateFormDefinitionRequest = {
      name: control.value.toString(),
      formDefinition: JSON.stringify(this.formToDuplicate.formDefinition),
    };

    combineLatest([
      this.formManagementService.createFormDefinition(request),
      this.route.queryParams,
    ])
      .pipe(take(1))
      .subscribe({
        next: ([formDefinition]) => {
          this.disablePendingChangesCallback();
          this.navigateWithNewId(formDefinition.id).then(() => window.location.reload());
        },
        error: err => {
          if (err.toString().includes('Duplicate name')) {
            control.setErrors({duplicate: true});
          } else {
            control.setErrors({incorrect: true});
          }
        },
      });
  }

  private async navigateWithNewId(newId: string): Promise<boolean> {
    const currentUrl = this.router.url.split('?')[0];
    const segments = currentUrl.split('/');

    const formIdIndex = segments.findIndex(segment => segment.match(/^[a-f0-9-]{36}$/));

    if (formIdIndex !== -1) {
      segments[formIdIndex] = newId;
    }

    const updatedUrl = segments.join('/');
    const queryParams = {...this.route.snapshot.queryParams};

    try {
      const success = await this.router.navigate([updatedUrl], {queryParams});
      console.log('Navigation successful:', success);
      return success;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }
}
