import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, filter, map, Observable, Subscription, switchMap} from 'rxjs';
import {CaseSettings, DocumentService} from '@valtimo/document';
import {tap} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'valtimo-dossier-management-external-create-case-form',
  templateUrl: './dossier-management-external-create-case-form.component.html',
})
export class DossierManagementExternalCreateCaseFormComponent implements OnInit, OnDestroy {
  readonly disabled$ = new BehaviorSubject<boolean>(false);

  private readonly _refresh$ = new BehaviorSubject<null>(null);

  readonly loading$ = new BehaviorSubject<boolean>(true);

  private documentDefinitionName: string = null;

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => {
      console.log('params', params);
      this.documentDefinitionName = params.name || '';
      return params.name || ''
    })
  );

  readonly currentValue$: Observable<CaseSettings> = this._refresh$.pipe(
    switchMap(() => this.documentDefinitionName$),
    switchMap(documentDefinitionName =>
      this.documentService.getCaseSettingsForManagement(documentDefinitionName)
    ),
    tap(() => this.loading$.next(false))
  );

  public form!: FormGroup;

  private _subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({
      hasExternalForm: [false], // Toggle is off by default
      externalFormUrl: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
    });
  }

  ngOnInit(): void {
    // Subscribe to the toggle field value changes
    const hasExternalFormToggleSubscription = this.hasExternalForm?.valueChanges.subscribe((isEnabled) => {
      const urlControl = this.externalFormUrl;
      if (isEnabled) {
        urlControl?.enable();
      } else {
        urlControl?.disable();
        urlControl?.reset(); // Clear the URL field when disabled
      }
    });

    // Add the subscription to the Subscription manager
    if (hasExternalFormToggleSubscription) {
      this._subscriptions.add(hasExternalFormToggleSubscription);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when the component is destroyed
    this._subscriptions.unsubscribe();
  }

  public get hasExternalForm(){
    return this.form.get('hasExternalForm')
  }

  public get externalFormUrl(){
    return this.form.get('externalFormUrl')
  }

  // Helper to check if the form is valid
  canSubmit(): boolean {
    return this.form.valid;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.canSubmit()) {
      console.log('Form submitted with values:', this.form.value);

      this.updateCaseSettings(
        {
          hasExternalCreateCaseForm: this.hasExternalForm.value,
          externalCreateCaseFormUrl: this.externalFormUrl.value,
        },
        this.documentDefinitionName
      )
    }
  }

  updateCaseSettings(caseSettings: CaseSettings, documentDefinitionName: string): void {
    this.disableInput();

    this.documentService
      .patchCaseSettingsForManagement(documentDefinitionName, caseSettings)
      .subscribe({
        next: () => {
          this.enableInput();
          this.refreshSettings();
        },
        complete: () => {
          this.enableInput();
        },
      });
  }

  disableInput(): void {
    this.disabled$.next(true);
  }

  enableInput(): void {
    this.disabled$.next(false);
  }

  private refreshSettings(): void {
    this._refresh$.next(null);
  }
}
