import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest} from 'rxjs';
import {take} from 'rxjs/operators';
import {
  BaseModal,
  ButtonModule,
  InputModule,
  ModalModule,
  ModalService,
} from 'carbon-components-angular';
import {AlertService} from 'dist/valtimo/components';
import {CreateFormDefinitionRequest} from '../../models';
import {FormManagementService} from '../../services';
import {noDuplicateFormValidator} from '../../validators/no-duplicate-form.validator';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-form-management-duplicate-modal',
  templateUrl: './form-management-duplicate.component.html',
  styleUrls: ['./form-management-duplicate.component.scss'],
  standalone: true,
  imports: [
    // Standalone component dependencies
    CommonModule,
    TranslateModule,
    ModalModule,
    ButtonModule,
    InputModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class FormManagementDuplicateComponent extends BaseModal {
  duplicateForm = new FormGroup({
    duplicateFormName: new FormControl(
      this.getDefaultName(),
      Validators.compose([Validators.required]),
      [noDuplicateFormValidator(this.formManagementService)]
    ),
  });

  constructor(
    @Inject('formToDuplicate') public formToDuplicate,
    protected modalService: ModalService,
    protected formManagementService: FormManagementService,
    private alertService: AlertService,
    protected route: ActivatedRoute,
    private router: Router
  ) {
    super();
    this.duplicateForm.markAllAsTouched();
  }

  public duplicate() {
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
      .subscribe(
        ([formDefinition, params]) => {
          this.alertService.success('Created new Form');
          this.router
            .navigateByUrl(`/form-management/edit/${formDefinition.id}`)
            .then(() => window.location.reload());
        },
        err => {
          if (err.toString().includes('Duplicate name')) {
            control.setErrors({duplicate: true});
          } else {
            control.setErrors({incorrect: true});
          }
        }
      );
  }

  get duplicateFormName(): FormControl {
    return this.duplicateForm.controls['duplicateFormName'];
  }

  public getDefaultName(): string {
    return this.formToDuplicate.name + '-duplicate';
  }
}
