import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService, WidgetModule} from '@valtimo/components'; // Assuming this is your alert service location
import {FormManagementService} from '../../services';
import {CreateFormDefinitionRequest} from '../../models';
import {combineLatest} from 'rxjs';
import {take} from 'rxjs/operators';
import {noDuplicateFormValidator} from '../../validators/no-duplicate-form.validator';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule, InputModule} from 'carbon-components-angular';

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
  ],
})
export class FormManagementCreateComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private formManagementService: FormManagementService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  get formControls() {
    return this.form.controls;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: new FormControl('', Validators.required, [
        noDuplicateFormValidator(this.formManagementService),
      ]),
    });
  }

  reset() {
    this.form.setValue({
      name: '',
    });
  }

  createFormDefinition() {
    const emptyForm = {
      display: 'form',
      components: [],
    };
    const request: CreateFormDefinitionRequest = {
      name: this.form.value.name,
      formDefinition: JSON.stringify(emptyForm),
    };
    combineLatest([
      this.formManagementService.createFormDefinition(request),
      this.route.queryParams,
    ])
      .pipe(take(1))
      .subscribe(
        ([formDefinition, params]) => {
          this.alertService.success('Created new Form');

          if (params?.upload === 'true') {
            this.router.navigate(['/form-management/edit', formDefinition.id], {
              queryParams: {upload: 'true'},
            });
          } else {
            this.router.navigate(['/form-management/edit', formDefinition.id]);
          }
        },
        err => {
          this.alertService.error('Error creating new Form');
        }
      );
  }
}
