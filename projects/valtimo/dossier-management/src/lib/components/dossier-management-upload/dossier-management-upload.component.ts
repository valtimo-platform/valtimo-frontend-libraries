/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {CARBON_CONSTANTS, ModalComponent} from '@valtimo/components';
import {DocumentDefinitionCreateRequest, DocumentService} from '@valtimo/document';
import {FileItem, NotificationContent} from 'carbon-components-angular';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  take,
} from 'rxjs';

import {DossierImportService} from '../../services/dossier-import.service';
import {STEPS, UPLOAD_STATUS, UPLOAD_STEP} from './dossier-management-upload.constants';

@Component({
  selector: 'valtimo-dossier-management-upload',
  templateUrl: './dossier-management-upload.component.html',
  styleUrls: ['./dossier-management-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementUploadComponent implements OnInit, AfterViewInit {
  @ViewChild('uploadDefinitionModal') modal: ModalComponent;

  @Input() open = false;
  @Output() closeModal = new EventEmitter<boolean>();

  public acceptedFiles: string[] = ['.json', '.zip'];
  public selectedFile: File | null;

  private readonly _disabled$ = new BehaviorSubject<boolean>(true);

  public readonly UPLOAD_STEP = UPLOAD_STEP;
  public readonly UPLOAD_STATUS = UPLOAD_STATUS;
  public readonly activeStep$ = new BehaviorSubject<UPLOAD_STEP>(UPLOAD_STEP.PLUGINS);
  public readonly backButtonEnabled$: Observable<boolean> = this.activeStep$.pipe(
    map((activeStep: UPLOAD_STEP) =>
      [UPLOAD_STEP.FILE_SELECT, UPLOAD_STEP.ACCESS_CONTROL, UPLOAD_STEP.DASHBOARD].includes(
        activeStep
      )
    )
  );
  public readonly jsonString$ = new BehaviorSubject<string>('');
  public readonly nextButtonDisabled$ = combineLatest([this.activeStep$, this._disabled$]).pipe(
    map(([activeStep, disabled]) => ![UPLOAD_STEP.PLUGINS].includes(activeStep) && disabled)
  );
  public readonly uploadStatus$ = new BehaviorSubject<UPLOAD_STATUS>(UPLOAD_STATUS.ACTIVE);

  public readonly notificationObj$: Observable<NotificationContent | null> = this.translateService
    .stream('key')
    .pipe(
      map(() => ({
        title: this.translateService.instant('dossierManagement.importDefinition.warning.title'),
        message: this.translateService.instant(
          'dossierManagement.importDefinition.warning.message'
        ),
        type: 'warning',
        lowContrast: true,
        showClose: false,
        closeLabel: '',
      }))
    );

  public form: FormGroup = this.fb.group({
    file: this.fb.control(new Set<any>(), [Validators.required]),
  });

  private readonly _subscriptions = new Subscription();
  private readonly _zipFd$ = new BehaviorSubject<FormData | null>(null);

  constructor(
    private readonly documentService: DocumentService,
    private readonly dossierImportService: DossierImportService,
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    const control: AbstractControl | null = this.form.get('file');
    if (!control) {
      return;
    }

    this._subscriptions.add(
      control.valueChanges.subscribe((fileSet: Set<FileItem>) => {
        const [fileItem] = fileSet;
        if (!fileItem) {
          this._disabled$.next(true);
          return;
        }

        if (fileItem.file.type === 'application/json') {
          this.setJsonFile(fileItem);
          return;
        }

        this.setZipFile(fileItem);
      })
    );
  }

  public ngAfterViewInit(): void {
    this.clearJsonString();
  }

  public ngOnDestroy(): void {
    this.resetModal();
  }

  public onCloseModal(definitionUploaded?: boolean): void {
    this.closeModal.emit(definitionUploaded ?? false);
    this.resetModal();
  }

  public onBackClick(activeStep: UPLOAD_STEP): void {
    const prevIndex: number = STEPS.findIndex((step: UPLOAD_STEP) => step === activeStep) - 1;
    if (prevIndex === -1) {
      return;
    }

    this.activeStep$.next(STEPS[prevIndex]);
  }

  public onNextClick(activeStep: UPLOAD_STEP): void {
    const nextIndex: number = STEPS.findIndex((step: UPLOAD_STEP) => step === activeStep) + 1;
    if (nextIndex === STEPS.length) {
      return;
    }

    this.activeStep$.next(STEPS[nextIndex]);
    if (STEPS[nextIndex] !== UPLOAD_STEP.FILE_UPLOAD) {
      return;
    }

    if (this._fileItem.file.type === 'application/json') {
      this.uploadJsonDefinition();
      return;
    }

    this.uploadZipDefinition();
  }

  private _fileItem: FileItem;
  private setJsonFile(fileItem: FileItem | undefined): void {
    const file = fileItem?.file;

    if (!file) {
      this.clearJsonString();
      return;
    }
    this._fileItem = fileItem;

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = (reader.result ?? '').toString();
      console.log('valid', this.stringIsValidJson(result));
      if (this.stringIsValidJson(result)) {
        this._disabled$.next(false);
        this.jsonString$.next(result);
        return;
      }

      this.clearJsonString();
      this.setErrorState(fileItem);
    };

    reader.readAsText(file);
  }

  private setZipFile(fileItem: FileItem): void {
    const file = fileItem?.file;

    if (!file) {
      this._zipFd$.next(null);
      return;
    }

    this._fileItem = fileItem;
    const blob = new Blob([fileItem.file], {type: fileItem.file.type});
    const fd = new FormData();
    fd.append('file', blob, fileItem.file.name);
    this._zipFd$.next(fd);
    this._disabled$.next(false);
  }

  private uploadJsonDefinition(): void {
    this._disabled$.next(true);

    this.jsonString$
      .pipe(
        switchMap(jsonString =>
          this.documentService.createDocumentDefinitionForManagement(
            new DocumentDefinitionCreateRequest(jsonString)
          )
        ),
        take(1)
      )
      .subscribe({
        next: () => {
          this._disabled$.next(false);
          this.uploadStatus$.next(UPLOAD_STATUS.FINISHED);
        },
        error: () => {
          this.uploadStatus$.next(UPLOAD_STATUS.ERROR);
          this._disabled$.next(false);
        },
      });
  }

  private uploadZipDefinition(): void {
    this._disabled$.next(true);

    this._zipFd$
      .pipe(
        filter((fd: FormData | null) => !!fd),
        switchMap((fd: FormData | null) =>
          this.dossierImportService.importDocumentDefinitionZip(fd ?? new FormData())
        ),
        take(1)
      )
      .subscribe({
        next: () => {
          this._disabled$.next(false);
          this.uploadStatus$.next(UPLOAD_STATUS.FINISHED);
        },
        error: () => {
          this.uploadStatus$.next(UPLOAD_STATUS.ERROR);
          this._disabled$.next(false);
        },
      });
  }

  private clearJsonString(): void {
    this.jsonString$.next('');
  }

  private stringIsValidJson(string: string) {
    try {
      JSON.parse(string);
    } catch (e) {
      return false;
    }
    return true;
  }

  private setErrorState(fileItem: FileItem): void {
    this._disabled$.next(true);
    fileItem.invalid = true;
    fileItem.invalidTitle = this.translateService.instant(
      'dossierManagement.importDefinition.invalidJsonError.title'
    );
    fileItem.invalidText = this.translateService.instant(
      'dossierManagement.importDefinition.invalidJsonError.text'
    );
  }

  private resetModal(): void {
    setTimeout(() => {
      this.activeStep$.next(UPLOAD_STEP.PLUGINS);
      this.uploadStatus$.next(UPLOAD_STATUS.ACTIVE);
      this._subscriptions.unsubscribe();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }
}
