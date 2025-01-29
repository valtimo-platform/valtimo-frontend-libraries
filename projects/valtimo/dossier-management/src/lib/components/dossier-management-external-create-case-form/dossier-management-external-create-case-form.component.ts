import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, filter, map, Observable, Subscription} from 'rxjs';
import {CaseSettings, DocumentService} from '@valtimo/document';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'valtimo-dossier-management-external-create-case-form',
  templateUrl: './dossier-management-external-create-case-form.component.html',
})
export class DossierManagementExternalCreateCaseFormComponent implements OnInit, OnDestroy {
  public form!: FormGroup;

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params?.name),
    filter(docDefName => !!docDefName)
  );

  readonly caseSettings$: BehaviorSubject<CaseSettings> = new BehaviorSubject(null);

  private _subscriptions = new Subscription();

  constructor(
    private readonly logger: NGXLogger,
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.logger.debug('External Case Create Form - onInit');

    this.form = this.fb.group({
      hasExternalForm: [false], // Toggle is off by default
      externalFormUrl: [ {value: '', disabled: true},
        [Validators.required, Validators.pattern(/https?:\/\/.+/), Validators.maxLength(512)],
      ],
    });

    // Subscribe to the toggle field value changes
    this._subscriptions.add(
      this.hasExternalForm?.valueChanges.subscribe(isEnabled => {
        const urlControl = this.externalFormUrl;
        if (isEnabled) {
          urlControl?.enable();
        } else {
          urlControl?.disable();
          urlControl?.reset(); // Clear the URL field when disabled
        }
      })
    );

    this._subscriptions.add(
      this.documentDefinitionName$.subscribe(documentDefinitionName => {
        this.logger.debug(
          'Fetching case definition settings for documentDefinitionName',
          documentDefinitionName
        );
        this.documentService
          .getCaseSettingsForManagement(documentDefinitionName)
          .subscribe(caseSettings => {
            this.logger.debug('Fetched case definition settings', caseSettings);
            this.caseSettings$.next(caseSettings);
          });
      })
    );

    this._subscriptions.add(
      this.caseSettings$.subscribe(caseSettings => {
        if (caseSettings) {
          this.logger.debug('Applying case definition settings to form', caseSettings);
          this.form.setValue({
            hasExternalForm: caseSettings.hasExternalCreateCaseForm,
            externalFormUrl: caseSettings.externalCreateCaseFormUrl,
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.logger.debug('External Case Create Form - onDestroy');
    // Clean up subscriptions when the component is destroyed
    this._subscriptions.unsubscribe();
  }

  public get hasExternalForm() {
    return this.form.get('hasExternalForm');
  }

  public get externalFormUrl() {
    return this.form.get('externalFormUrl');
  }

  // Helper to check if the form is valid
  canSubmit(): boolean {
    return this.form.valid;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.canSubmit()) {
      this.logger.debug('Submitted case definition settings form with values:', this.form.value);

      this.updateCaseSettings(this.caseSettings$.getValue().name, {
        hasExternalCreateCaseForm: this.hasExternalForm.value,
        externalCreateCaseFormUrl: (typeof this.externalFormUrl.value === 'string') ?
          this.externalFormUrl.value.trim() : this.externalFormUrl.value
      });
    }
  }

  updateCaseSettings(documentDefinitionName: string, caseSettings: CaseSettings): void {
    this.logger.debug('Updating case definition settings', documentDefinitionName, caseSettings);
    this.documentService
      .patchCaseSettingsForManagement(documentDefinitionName, caseSettings)
      .subscribe({
        next: result => {
          this.logger.debug('Updated case definition settings', result);
          this.caseSettings$.next(result);
        },
        error: e => {
          this.logger.debug('An error occurred while updating case definition settings', e);
        },
        complete: () => {
          this.logger.debug('Finished updating case definition settings');
        },
      });
  }
}
