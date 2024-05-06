/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {
  AdditionalDocumentDate,
  ConfidentialityLevel,
  DocumentenApiMetadata,
  DocumentLanguage,
  DocumentStatus,
} from '../../models';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  from,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '@valtimo/document';
import {KeycloakService} from 'keycloak-angular';
import {tap} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  InputLabelModule,
  InputModule,
  ModalService,
  SelectModule,
  ValtimoModalService,
} from '@valtimo/components';

import {
  ButtonModule,
  ComboBoxModule,
  DatePickerModule,
  DropdownModule,
  IconModule,
  InputModule as CarbonInputModule,
  ListItem,
  ModalModule,
  RadioModule,
  TagModule,
  TooltipModule,
} from 'carbon-components-angular';
import {DocumentenApiDocumentService} from '../../services';
import {DocumentenApiTagService} from '../../services/documenten-api-tag.service';

@Component({
  selector: 'valtimo-documenten-api-metadata-modal',
  templateUrl: './documenten-api-metadata-modal.component.html',
  styleUrls: ['./documenten-api-metadata-modal.component.scss'],
  standalone: true,
  imports: [
    ButtonModule,
    CarbonInputModule,
    ComboBoxModule,
    CommonModule,
    DatePickerModule,
    DropdownModule,
    IconModule,
    InputLabelModule,
    InputModule,
    ModalModule,
    RadioModule,
    ReactiveFormsModule,
    SelectModule,
    TagModule,
    TooltipModule,
    TranslateModule,
  ],
})
export class DocumentenApiMetadataModalComponent implements OnInit {
  @Input() disabled$!: Observable<boolean>;
  @Input() file$!: Observable<any>;

  @Input() author: string;
  @Input() confidentialityLevel: string;
  @Input() description: string;
  @Input() disableAuthor: boolean;
  @Input() disableConfidentialityLevel: boolean;
  @Input() disableDescription: boolean;
  @Input() disableDocumentTitle: boolean;
  @Input() disableDocumentType: boolean;
  @Input() disableFilename: boolean;
  @Input() disableLanguage: boolean;
  @Input() disableStatus: boolean;
  @Input() documentTitle = '';
  @Input() documentType: string;
  @Input() disableTrefwoorden: boolean;
  @Input() filename: string;
  @Input() isEditMode: boolean;
  @Input() language: string;
  @Input() open = false;
  @Input() status: string;
  @Input() trefwoorden: boolean;

  @Output() metadata: EventEmitter<DocumentenApiMetadata> = new EventEmitter();
  @Output() close: EventEmitter<boolean> = new EventEmitter();

  public documentenApiMetadataForm: FormGroup;

  public readonly CONFIDENTIALITY_LEVELS: Array<ConfidentialityLevel> = [
    'openbaar',
    'beperkt_openbaar',
    'intern',
    'zaakvertrouwelijk',
    'vertrouwelijk',
    'confidentieel',
    'geheim',
    'zeer_geheim',
  ];
  public readonly confidentialityLevelItems$: Observable<Array<ListItem>> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this.CONFIDENTIALITY_LEVELS.map(confidentialityLevel => ({
          id: confidentialityLevel,
          content: this.translateService.instant(`document.${confidentialityLevel}`),
          selected: false,
        }))
      )
    );
  public readonly ADDITONAL_DOCUMENT_DATE_OPTIONS: Array<{
    value: AdditionalDocumentDate;
    translationKey: string;
  }> = [
    {
      value: 'neither',
      translationKey: 'document.noAdditionalDate',
    },
    {
      value: 'sent',
      translationKey: 'document.sendDate',
    },
    {
      value: 'received',
      translationKey: 'document.receiptDate',
    },
  ];
  public readonly clearStatusSelection$ = new Subject<null>();
  public readonly additionalDocumentDate$ = new BehaviorSubject<AdditionalDocumentDate>('neither');
  public readonly STATUSES: Array<DocumentStatus> = [
    'in_bewerking',
    'ter_vaststelling',
    'definitief',
    'gearchiveerd',
  ];
  public readonly RECEIPT_STATUSES: Array<DocumentStatus> = ['definitief', 'gearchiveerd'];
  public readonly formData$ = new BehaviorSubject<DocumentenApiMetadata>(null);
  public readonly statusItems$: Observable<Array<ListItem>> = combineLatest([
    this.additionalDocumentDate$,
    this.translateService.stream('key'),
  ]).pipe(
    tap(([additionalDocumentDate]) => {
      this.formData$.pipe(take(1)).subscribe(formData => {
        if (
          additionalDocumentDate === 'received' &&
          (formData.status === 'in_bewerking' || formData.status === 'ter_vaststelling')
        ) {
          this.clearStatusSelection$.next(null);
        }
      });
    }),
    map(([additionalDocumentDate]) =>
      (additionalDocumentDate === 'received' ? this.RECEIPT_STATUSES : this.STATUSES).map(
        status => ({
          id: status,
          content: this.translateService.instant(`document.${status}`),
          selected: false,
        })
      )
    )
  );
  public readonly LANGUAGES: Array<DocumentLanguage> = ['nld', 'eng', 'deu'];
  public readonly languageItems$: Observable<Array<ListItem>> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this.LANGUAGES.map(
          language =>
            ({
              id: language,
              content: this.translateService.instant(`document.${language}`),
              selected: false,
            }) as ListItem
        )
      )
    );

  public readonly documentDefinitionName$: Observable<string> = from(
    this.route.params.pipe(map(params => params?.documentDefinitionName))
  );

  public readonly tagItems$: Observable<Array<ListItem>> = combineLatest([
    this.documentDefinitionName$
  ]).pipe(
    filter(([documentDefinitionName]) => !!documentDefinitionName),
    switchMap(([documentDefinitionName]) =>
      this.documentenApiTagService.getTags(documentDefinitionName)
    ),
    map(tags => tags.map(tag => ({id: tag.value, content: tag.value, selected: false})))
  );

  public readonly documentTypeItems$: Observable<Array<ListItem>> = combineLatest([
    this.route?.params || of(null),
    this.route?.firstChild?.params || of(null),
    this.valtimoModalService.documentDefinitionName$,
  ]).pipe(
    filter(
      ([params, firstChildParams, documentDefinitionName]) =>
        !!(
          params?.documentDefinitionName ||
          firstChildParams?.documentDefinitionName ||
          documentDefinitionName
        )
    ),
    switchMap(([params, firstChildParams, documentDefinitionName]) =>
      this.documentService.getDocumentTypes(
        params?.documentDefinitionName ||
          firstChildParams?.documentDefinitionName ||
          documentDefinitionName
      )
    ),
    map(documentTypes =>
      documentTypes.map(type => ({id: type.url, content: type.name, selected: false}))
    )
  );
  public readonly userEmail$ = from(this.keycloakService.loadUserProfile()).pipe(
    map(userProfile => userProfile?.email || '')
  );

  private readonly modalSize = 'lg';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly documentenApiDocumentService: DocumentenApiDocumentService,
    private readonly documentenApiTagService: DocumentenApiTagService,
    private readonly fb: FormBuilder,
    private readonly keycloakService: KeycloakService,
    private readonly modalService: ModalService,
    private readonly translateService: TranslateService,
    private readonly valtimoModalService: ValtimoModalService
  ) {}

  public ngOnInit(): void {
    this.setInitForm();

    this.file$?.subscribe(file => {
      this.prefillForm(file);
    });
  }

  public prefillForm(file) {
    if (file) {
      const {
        fileName,
        title,
        author,
        description,
        language,
        informatieobjecttype,
        status,
        confidentialityLevel,
        creationDate,
        receiptDate,
        sendDate,
      } = file;
      this.documentenApiMetadataForm.patchValue({
        filename: fileName,
        title: title,
        author: author,
        description: description,
        languages: this.findItemByContent(this.languageItems$, language),
        informatieobjecttype: informatieobjecttype,
        status: this.findItemByContent(this.statusItems$, status),
        confidentialityLevel: this.findItemByContent(this.confidentialityLevelItems$, confidentialityLevel),
        creationDate: creationDate,
        receiptDate: receiptDate,
        sendDate: sendDate,
      });
    }
    console.log('File: ', file);
  }

  public save(): void {
    this.setCorrectValues();
    this.formatDate('creationDate');
    this.formatDate('sendDate');
    this.formatDate('receiptDate');

    if (this.documentenApiMetadataForm.valid)
      this.metadata.emit(this.documentenApiMetadataForm.value);

    this.closeModal();
  }

  public setCorrectValues(): void {
    this.documentenApiMetadataForm.patchValue({
      language: this.documentenApiMetadataForm.controls.language.value.id,
      confidentialityLevel: this.documentenApiMetadataForm.controls.confidentialityLevel.value.id,
      informatieobjecttype: this.documentenApiMetadataForm.controls.informatieobjecttype.value.id,
      status: this.documentenApiMetadataForm.controls.status.value.id,
    });
  }

  public setInitForm(): void {
    this.documentenApiMetadataForm = this.fb.group({
      filename: this.fb.control('', Validators.required),
      title: this.fb.control('', Validators.required),
      author: this.fb.control('', Validators.required),
      description: this.fb.control('', Validators.required),
      language: this.fb.control('', Validators.required),
      informatieobjecttype: this.fb.control('', Validators.required),
      status: this.fb.control('', Validators.required),
      confidentialityLevel: this.fb.control('', Validators.required),
      creationDate: this.fb.control('', Validators.required),
      receiptDate: this.fb.control(''),
      sendDate: this.fb.control(''),
    });

    // FIND OTHER WAY TO DO IT
    combineLatest([this.userEmail$, this.file$])
      .pipe(take(1))
      .pipe(
        tap(([userEmail, file]) => {
          console.log("user email: ", userEmail);
          this.documentenApiMetadataForm.patchValue({
            fileName: file?.name,
             author: userEmail
           })
        })
      )
      .subscribe();
  }

  private setAdditionalDate(value: AdditionalDocumentDate): void {
    this.additionalDocumentDate$.next(value);
  }

  public closeModal(): void {
    this.setInitForm();
    this.additionalDocumentDate$.next('neither');
    this.close.emit();
  }

  private findItemByContent(items$: Observable<any[]>, content: string): Observable<any> {
    return items$.pipe(map(items => items.find(item => item.content === content)));
  }

  private formatDate(controlName: string) {
    const control = this.documentenApiMetadataForm.controls[controlName];
    if (control.value) {
      const date = new Date(control.value);
      this.documentenApiMetadataForm.patchValue({
        [controlName]: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
      });
    }
  }
}
