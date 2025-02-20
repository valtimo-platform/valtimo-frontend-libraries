import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, filter, map, Observable, Subscription} from 'rxjs';
import {CaseSettings, DocumentService} from '@valtimo/document';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NGXLogger} from 'ngx-logger';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-dossier-management-external-start-case-form',
  templateUrl: './dossier-management-external-start-case-form.component.html',
})
export class DossierManagementExternalStartCaseFormComponent implements OnInit, OnDestroy {
  public form!: FormGroup;

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params?.name),
    filter(docDefName => !!docDefName)
  );

  readonly caseSettings$: BehaviorSubject<CaseSettings> = new BehaviorSubject(null);

  private readonly urlPattern = new RegExp(
    '^(https?:\\/\\/)(([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|\\d{1,3}(\\.\\d{1,3}){3})(:\\d+)?(\\/\\S*)?(\\?\\S*)?(#\\S*)?$'
  );

  private _subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService,
    private readonly logger: NGXLogger,
  ) { }

  ngOnInit(): void {
    this.logger.debug('External Case Start Form - onInit');

    this.form = this.fb.group({
      hasExternalForm: [false], // Toggle is off by default
      externalFormUrl: [ {value: '', disabled: true}, [
        Validators.required,
        Validators.pattern(this.urlPattern),
        Validators.maxLength(512)
      ]],
    });

    // Subscribe to the toggle field value changes
    this._subscriptions.add(
      this.hasExternalForm?.valueChanges.subscribe(isEnabled => {
        if (isEnabled) {
          this.externalFormUrl.enable();
        } else {
          this.externalFormUrl.disable();
          this.externalFormUrl.reset(); // Clear the URL field when disabled
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
            hasExternalForm: caseSettings.hasExternalStartCaseForm,
            externalFormUrl: caseSettings.externalStartCaseFormUrl,
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.logger.debug('External Case Start Form - onDestroy');
    // Clean up subscriptions when the component is destroyed
    this._subscriptions.unsubscribe();
  }

  public get hasExternalForm() {
    return this.form.get('hasExternalForm');
  }

  public get externalFormUrl() {
    return this.form.get('externalFormUrl');
  }

  public canSubmit(): boolean {
    return this.form.valid;
  }

  public onSubmit(): void {
    if (this.canSubmit()) {
      this.logger.debug('Submitted case definition settings form with values:', this.form.value);
      const caseSettings = this.caseSettings$.getValue();
      this.updateCaseSettings(caseSettings.name, {
        hasExternalStartCaseForm: this.hasExternalForm.value,
        externalStartCaseFormUrl: (typeof this.externalFormUrl.value === 'string') ?
          this.externalFormUrl.value.trim() : this.externalFormUrl.value
      });
    }
  }

  private updateCaseSettings(documentDefinitionName: string, caseSettings: CaseSettings): void {
    this.logger.debug('Updating case definition settings', documentDefinitionName, caseSettings);
    this.documentService
      .patchCaseSettingsForManagement(documentDefinitionName, caseSettings)
      .subscribe({
        next: result => {
          this.logger.debug('Updated case definition settings', result);
          this.caseSettings$.next(result);
        },
        error: e => {
          this.logger.error('An error occurred while updating case definition settings', e);
          this.toastrService.error(this.translateService.instant('dossierManagement.externalStartCaseForm.notification.error'))
        },
        complete: () => {
          this.logger.debug('Finished updating case definition settings');
          this.toastrService.success(this.translateService.instant('dossierManagement.externalStartCaseForm.notification.success'));
        },
      });
  }
}
