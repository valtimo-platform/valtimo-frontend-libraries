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

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

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
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '@valtimo/document';
import {KeycloakService} from 'keycloak-angular';
import {tap} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  InputLabelModule,
  InputModule,
  ModalService,
  SelectModule,
  ValtimoModalService,
  VModalComponent,
  VModalModule,
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
    VModalModule,
  ],
})
export class DocumentenApiMetadataModalComponent implements OnInit, OnDestroy {
  @ViewChild('metadataModal') metadataModal: VModalComponent;

  @Input() disabled$!: Observable<boolean>;
  @Input() file$!: Observable<any>;

  @Input() author: string;
  @Input() hideAuthor: boolean = false;
  @Input() set disableAuthor(value: boolean) {
    if (value) {
      this.auteur.disable();
    } else {
      this.auteur.enable();
    }
  }
  @Input() confidentialityLevel: string;
  @Input() hideConfidentialityLevel: boolean = false;
  @Input() set disableConfidentialityLevel(value: boolean) {
    if (value) {
      this.confidentialityLevelFormControl.disable();
    } else {
      this.confidentialityLevelFormControl.enable();
    }
  }
  @Input() description: string;
  @Input() hideDescription: boolean = false;
  @Input() set disableDescription(value: boolean) {
    if (value) {
      this.beschrijving.disable();
    } else {
      this.beschrijving.enable();
    }
  }
  @Input() documentTitle = '';
  @Input() hideDocumentTitle: boolean = false;
  @Input() set disableDocumentTitle(value: boolean) {
    if (value) {
      this.titel.disable();
    } else {
      this.titel.enable();
    }
  }
  @Input() documentType: string;
  @Input() hideDocumentType: boolean = false;
  @Input() set disableDocumentType(value: boolean) {
    if (value) {
      this.informatieobjecttypeFormControl.disable();
    } else {
      this.informatieobjecttypeFormControl.enable();
    }
  }
  @Input() filename: string;
  @Input() hideFilename: boolean = false;
  @Input() set disableFilename(value: boolean) {
    if (value) {
      this.bestandsnaam.disable();
    } else {
      this.bestandsnaam.enable();
    }
  }
  @Input() language: string;
  @Input() hideLanguage: boolean = false;
  @Input() set disableLanguage(value: boolean) {
    if (value) {
      this.languageFormControl.disable();
    } else {
      this.languageFormControl.enable();
    }
  }
  @Input() status: string;
  @Input() hideStatus: boolean = false;
  @Input() set disableStatus(value: boolean) {
    if (value) {
      this.statusFormControl.disable();
    } else {
      this.statusFormControl.enable();
    }
  }
  @Input() tags: string[];
  @Input() hideTags: boolean = false;
  @Input() supportsTrefwoorden = false;
  @Input() hideCreationDate: boolean = false;
  @Input() set disableCreationDate(value: boolean) {
    if (value) {
      this.creatiedatum.disable();
    } else {
      this.creatiedatum.enable();
    }
  }
  @Input() hideAdditionalDate: boolean = false;
  @Input() isEditMode: boolean;

  public readonly open$ = new BehaviorSubject<boolean>(false);

  @Input() set open(value: boolean) {
    this.open$.next(value);

    if (value) {
      this.modalService.openModal(this.metadataModal);
    } else {
      this.modalService.closeModal();
    }
  }

  @Output() metadata: EventEmitter<DocumentenApiMetadata> = new EventEmitter();
  @Output() modalClose: EventEmitter<boolean> = new EventEmitter();

  public filenameExtension: string = ""
  public documentenApiMetadataForm: FormGroup = this.fb.group({
    bestandsnaam: this.fb.control('', Validators.required),
    titel: this.fb.control('', Validators.required),
    auteur: this.fb.control('', Validators.required),
    beschrijving: this.fb.control(''),
    taal: this.fb.control('', Validators.required),
    informatieobjecttype: this.fb.control('', Validators.required),
    status: this.fb.control('', Validators.required),
    vertrouwelijkheidaanduiding: this.fb.control('', Validators.required),
    creatiedatum: this.fb.control('', Validators.required),
    ontvangstdatum: this.fb.control(''),
    verzenddatum: this.fb.control(''),
    trefwoorden: this.fb.control([]),
  });

  public get confidentialityLevelFormControl(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('vertrouwelijkheidaanduiding');
  }
  public get confidentialityLevelDisabled$(): Observable<boolean> {
    return this.confidentialityLevelFormControl.valueChanges.pipe(
      startWith(null),
      map(() => this.confidentialityLevelFormControl.disabled)
    );
  }

  public get informatieobjecttypeFormControl(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('informatieobjecttype');
  }
  public get informatieobjecttypeDisabled$(): Observable<boolean> {
    return this.informatieobjecttypeFormControl.valueChanges.pipe(
      startWith(null),
      map(() => this.informatieobjecttypeFormControl.disabled)
    );
  }

  public get languageFormControl(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('taal');
  }

  public get languageDisabled$(): Observable<boolean> {
    return this.languageFormControl.valueChanges.pipe(
      startWith(null),
      map(() => this.languageFormControl.disabled)
    );
  }

  public get statusFormControl(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('status');
  }
  public get statusDisabled$(): Observable<boolean> {
    return this.statusFormControl.valueChanges.pipe(
      startWith(null),
      map(() => this.informatieobjecttypeFormControl.disabled)
    );
  }

  public get tagFormControl(): AbstractControl<string[]> {
    return this.documentenApiMetadataForm.get('trefwoorden');
  }

  public get creatiedatum(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('creatiedatum');
  }

  public get titel(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('titel');
  }

  public get beschrijving(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('beschrijving');
  }

  public get auteur(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('auteur');
  }

  public get bestandsnaam(): AbstractControl<string> {
    return this.documentenApiMetadataForm.get('bestandsnaam');
  }

  public readonly isDefinitiveStatus$ = new BehaviorSubject<boolean>(false);

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
  public readonly confidentialityLevelItems$: Observable<Array<ListItem>> = combineLatest([
    this.confidentialityLevelFormControl.valueChanges.pipe(
      startWith(this.confidentialityLevelFormControl.value)
    ),
    this.translateService.stream('key'),
  ]).pipe(
    map(([currentConfidentialityLevel]) =>
      this.CONFIDENTIALITY_LEVELS.map(confidentialityLevel => ({
        id: confidentialityLevel,
        content: this.translateService.instant(`document.${confidentialityLevel}`),
        selected: currentConfidentialityLevel === confidentialityLevel,
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
    this.statusFormControl.valueChanges.pipe(startWith(this.statusFormControl.value)),
    this.translateService.stream('key'),
  ]).pipe(
    tap(([additionalDocumentDate, currentStatus]) => {
      this.formData$.pipe(take(1)).subscribe(formData => {
        if (
          additionalDocumentDate === 'received' &&
          (formData.status === 'in_bewerking' || formData.status === 'ter_vaststelling')
        ) {
          this.clearStatusSelection$.next(null);
        }
      });
    }),
    map(([additionalDocumentDate, currentStatus]) =>
      (additionalDocumentDate === 'received' ? this.RECEIPT_STATUSES : this.STATUSES).map(
        status => ({
          id: status,
          content: this.translateService.instant(`document.${status}`),
          selected: currentStatus === status,
        })
      )
    )
  );

  public readonly tagItems$: Observable<Array<ListItem>> = combineLatest([
    this.valtimoModalService.documentDefinitionName$,
    this.tagFormControl.valueChanges.pipe(startWith(this.tagFormControl.value)),
  ]).pipe(
    filter(([documentDefinitionName]) => !!documentDefinitionName),
    switchMap(([documentDefinitionName, tagFormControlValue]) =>
      combineLatest([
        this.documentenApiTagService.getTags(documentDefinitionName),
        of(tagFormControlValue),
      ])
    ),
    map(([tags, tagFormControlValue]) =>
      tags.map(tag => ({
        id: tag.value,
        content: tag.value,
        selected: !!tagFormControlValue ? tagFormControlValue.includes(tag.value) : false,
      }))
    )
  );

  public readonly LANGUAGES: Array<DocumentLanguage> = ['nld', 'eng', 'deu'];
  public languageItems$: Observable<Array<ListItem>> = combineLatest([
    this.languageFormControl.valueChanges.pipe(startWith(this.languageFormControl.value)),
    this.translateService.stream('key'),
  ]).pipe(
    map(([currentLanguage]) => {
      return this.LANGUAGES.map(
        (language: any) =>
          ({
            content: this.translateService.instant(`document.${language}`),
            id: language,
            selected: currentLanguage === language,
          }) as ListItem
      );
    })
  );

  public readonly documentTypeItems$: Observable<Array<ListItem>> = combineLatest([
    this.route?.params || of(null),
    this.route?.firstChild?.params || of(null),
    this.valtimoModalService.documentDefinitionName$,
    this.informatieobjecttypeFormControl.valueChanges.pipe(
      startWith(this.informatieobjecttypeFormControl.value)
    ),
  ]).pipe(
    filter(
      ([params, firstChildParams, documentDefinitionName]) =>
        !!(
          params?.documentDefinitionName ||
          firstChildParams?.documentDefinitionName ||
          documentDefinitionName
        )
    ),
    switchMap(([params, firstChildParams, documentDefinitionName, informatieobjecttypeValue]) =>
      combineLatest([
        this.documentService.getDocumentTypes(
          params?.documentDefinitionName ||
            firstChildParams?.documentDefinitionName ||
            documentDefinitionName
        ),
        of(informatieobjecttypeValue),
      ])
    ),
    map(([documentTypes, informatieobjecttypeValue]) =>
      documentTypes.map((type: any) => ({
        id: type.url,
        content: type.name,
        selected: informatieobjecttypeValue === type.url,
      }))
    )
  );
  public readonly userEmail$ = from(this.keycloakService.loadUserProfile()).pipe(
    map(userProfile => userProfile?.email || '')
  );

  private _subscriptions = new Subscription();
  private _fileSubscription!: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly documentenApiTagService: DocumentenApiTagService,
    private readonly fb: FormBuilder,
    private readonly keycloakService: KeycloakService,
    private readonly modalService: ModalService,
    private readonly translateService: TranslateService,
    private readonly valtimoModalService: ValtimoModalService
  ) {}

  public ngOnInit(): void {
    this.openFileSubscription();
    this.openDisabledSubscription();
    this.openFilenameSubscription();
    this.openDocumentDefinitionSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this._fileSubscription?.unsubscribe();
    this.isDefinitiveStatus$.next(false);
  }

  public languageSelected(event: {item: {id: string}}) {
    if (event.item.id) {
      this.documentenApiMetadataForm.patchValue({
        taal: event.item.id,
      });
    }
  }

  public tagsSelected(event: Array<ListItem>) {
    this.tagFormControl.patchValue(event.filter(tag => tag.selected).map(tag => tag.id));
  }

  public confidentialityLevelSelected(event: {item: {id: string}}) {
    if (event.item.id) {
      this.documentenApiMetadataForm.patchValue({
        vertrouwelijkheidaanduiding: event.item.id,
      });
    }
  }

  public statusSelected(event: {item: {id: string}}) {
    if (event.item.id) {
      this.documentenApiMetadataForm.patchValue({
        status: event.item.id,
      });
    }
  }

  public informatieobjecttypeSelected(event: {item: {id: string}}) {
    if (event.item.id) {
      this.documentenApiMetadataForm.patchValue({
        informatieobjecttype: event.item.id,
      });
    }
  }

  public prefillForm(file) {
    this.prefillFilenameAndAuthor();
    if (file) {
      const {
        bestandsnaam,
        titel,
        auteur,
        beschrijving,
        taal,
        informatieobjecttype,
        status,
        vertrouwelijkheidaanduiding,
        creatiedatum,
        ontvangstdatum,
        verzenddatum,
        trefwoorden,
      } = file;

      if (verzenddatum) this.additionalDocumentDate$.next('sent');
      else if (ontvangstdatum) this.additionalDocumentDate$.next('received');
      else this.additionalDocumentDate$.next('neither');

      const prefillStatus = this.status || status;
      const validPrefillStatus = this.STATUSES.includes(prefillStatus) ? prefillStatus : '';

      this.documentenApiMetadataForm.patchValue({
        bestandsnaam: this.filename || bestandsnaam,
        titel: titel,
        auteur: this.author || auteur,
        beschrijving: this.description || beschrijving,
        taal: this.language || taal,
        informatieobjecttype: this.documentType || informatieobjecttype,
        status: validPrefillStatus,
        vertrouwelijkheidaanduiding: this.confidentialityLevel || vertrouwelijkheidaanduiding,
        creatiedatum,
        ontvangstdatum,
        verzenddatum,
        trefwoorden: this.tags || trefwoorden,
      });
    }
  }

  public save(): void {
    this.formatDate('creatiedatum');
    this.formatDate('verzenddatum');
    this.formatDate('ontvangstdatum');

    const rawValue = this.documentenApiMetadataForm.getRawValue();
    const mappedRawValue = Object.keys(rawValue).reduce(
      (acc, currentKey) =>
        rawValue[currentKey] !== undefined ? {...acc, [currentKey]: rawValue[currentKey]} : acc,
      {}
    ) as DocumentenApiMetadata;

    if (this.documentenApiMetadataForm.valid) this.metadata.emit(mappedRawValue);

    this.closeModal();
  }

  public closeModal(): void {
    this.modalService.closeModal(() => {
      this.additionalDocumentDate$.next('neither');
      this.modalClose.emit();
      this.clearForm();
    });
  }

  private clearForm(): void {
    this.documentenApiMetadataForm.reset();
  }

  private prefillFilenameAndAuthor() {
    this._subscriptions.add(
      combineLatest([this.file$, this.userEmail$])
        .pipe(
          take(1),
          tap(([file, userEmail]) => {
            const filename = this.filename || file?.name || file?.bestandsnaam;
            this.filenameExtension = filename?.split(".")?.pop() || "";
            if (this.filenameExtension.length === filename.length) {
              this.filenameExtension = "";
            }
            this.documentenApiMetadataForm.patchValue({
              bestandsnaam: filename,
              auteur: this.author || userEmail,
              creatiedatum: this.toFormattedDate(file?.lastModified || new Date().getMilliseconds()),
              titel: this.documentTitle || this.filenameToTitle(filename),
            });
            if (this.areAllFieldsHidden()) {
              this.save();
            }
          })
        )
        .subscribe()
    );
  }

  private filenameToTitle(filename?: string) {
    if (!filename) {
      return null
    } else {
      filename = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]+/g, " ");
      return filename.charAt(0).toUpperCase() + filename.slice(1);
    }
  }

  private formatDate(controlName: string): void {
    const control = this.documentenApiMetadataForm.controls[controlName];
    if (control.value) {
      this.documentenApiMetadataForm.patchValue({
        [controlName]: this.toFormattedDate(control.value),
      });
    }
  }

  private toFormattedDate(milliseconds: number): string {
    const date = new Date(milliseconds);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  private openFileSubscription(): void {
    this._fileSubscription?.unsubscribe();
    if (this.file$) {
      this._fileSubscription = this.file$.subscribe(file => {
        if (file) {
          this.prefillForm(file);
          this.isDefinitiveStatus$.next(
            file.status === 'definitief' && this.isEditMode ? true : false
          );
        }
      });
    }
  }

  public openDisabledSubscription(): void {
    this._subscriptions.add(
      this.disabled$?.subscribe(disabled => {
        if (disabled) {
          this.documentenApiMetadataForm.disable();
        } else {
          this.documentenApiMetadataForm.enable();
        }
      })
    );
  }

  private openFilenameSubscription() {
    this._subscriptions.add(
      this.bestandsnaam.valueChanges.subscribe(
        bestandsnaam => {
          if (bestandsnaam && this.filenameExtension) {
            const bestandsnaamWithExtension = bestandsnaam.replace(/\.[^/.]+$/, "") + "." + this.filenameExtension;
            if (bestandsnaamWithExtension != bestandsnaam) {
              this.documentenApiMetadataForm.patchValue({
                bestandsnaam: bestandsnaamWithExtension,
              });
            }
          }
        }
      )
    );
  }

  private openDocumentDefinitionSubscription() {
    this._subscriptions.add(this.route?.params.pipe(
      map(params => params?.documentDefinitionName),
      filter(documentDefinitionName => documentDefinitionName),
    ).subscribe(documentDefinitionName => {
      this.valtimoModalService.setDocumentDefinitionName(documentDefinitionName);
    }));
  }

  private setAdditionalDate(value: AdditionalDocumentDate): void {
    this.additionalDocumentDate$.next(value);
  }

  private areAllFieldsHidden(): boolean {
    return this.hideAdditionalDate
      && this.hideAuthor
      && this.hideConfidentialityLevel
      && this.hideCreationDate
      && this.hideDescription
      && this.hideDocumentTitle
      && this.hideDocumentType
      && this.hideFilename
      && this.hideLanguage
      && this.hideStatus
      && this.hideTags
  }
}
