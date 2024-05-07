import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {TrashCan16} from '@carbon/icons';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ConfidentialityLevel} from '@valtimo/components';
import {DocumentService, DocumentType} from '@valtimo/document';
import {
  ButtonModule,
  DatePickerInputModule,
  DatePickerModule,
  DropdownModule,
  IconModule,
  IconService,
  InputModule,
  ListItem,
} from 'carbon-components-angular';
import {
  combineLatest,
  debounceTime,
  filter,
  map,
  Observable,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';

import {DocumentenApiFilterModel} from '../../models';
import {DocumentenApiTag} from '../../models/documenten-api-tag.model';
import {DocumentenApiTagService} from '../../services';

@Component({
  selector: 'valtimo-dossier-detail-tab-documenten-api-filter',
  templateUrl: './documenten-api-filter.component.html',
  styleUrls: ['./documenten-api-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DatePickerInputModule,
    DatePickerModule,
    DropdownModule,
    IconModule,
    InputModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
})
export class DocumentenApiFilterComponent implements OnInit, OnDestroy {
  @Output() filterEvent = new EventEmitter<DocumentenApiFilterModel>();

  private readonly _subscriptions = new Subscription();
  private readonly _confidentialityLevels: Array<ConfidentialityLevel> = [
    'openbaar',
    'beperkt_openbaar',
    'intern',
    'zaakvertrouwelijk',
    'vertrouwelijk',
    'confidentieel',
    'geheim',
    'zeer_geheim',
  ];

  private readonly _filter$ = this.route.queryParamMap.pipe(
    map(queryParams => {
      const {sort, ...filter} = queryParams['params'];
      if (this.formGroup) {
        this.formGroup.patchValue(filter, {emitEvent: false});
      }
      return filter;
    })
  );

  public readonly confidentialityLevels$: Observable<ListItem[]> = combineLatest([
    this._filter$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([filter]) =>
      this._confidentialityLevels.map((confidentialityLevel: ConfidentialityLevel) => ({
        content: this.translateService.instant(`document.${confidentialityLevel}`),
        selected: filter?.vertrouwelijkheidaanduiding === confidentialityLevel,
        id: confidentialityLevel,
      }))
    ),
    startWith([])
  );

  public readonly informationObjectTypes$: Observable<ListItem[]> = this.route.paramMap.pipe(
    filter((paramMap: ParamMap) => !!paramMap.get('documentDefinitionName')),
    switchMap((paramMap: ParamMap) =>
      combineLatest([
        this.documentService.getDocumentTypes(paramMap.get('documentDefinitionName') ?? ''),
        this._filter$,
      ])
    ),
    map(([types, filter]) =>
      types.map((type: DocumentType) => ({
        content: type.name,
        selected: filter?.informatieobjecttype === type.url,
        id: type.url,
      }))
    ),
    startWith([])
  );

  public readonly tags$: Observable<ListItem[]> = this.route.paramMap.pipe(
    filter((paramMap: ParamMap) => !!paramMap.get('documentDefinitionName')),
    switchMap((paramMap: ParamMap) =>
      this.documentenApiTagService.getTags(paramMap.get('documentDefinitionName') ?? '')
    ),
    map((tags: DocumentenApiTag[]) =>
      tags.map((tag: DocumentenApiTag) => ({content: tag.value, selected: false}))
    ),
    startWith([])
  );

  public readonly formGroup = this.fb.group({
    auteur: this.fb.control(''),
    vertrouwelijkHeidaanduiding: this.fb.control({}),
    creatiedatumfrom: this.fb.control(''),
    creatiedatumto: this.fb.control(''),
    informatieObjectType: this.fb.control({}),
    trefwoorden: this.fb.control([]),
    titel: this.fb.control(''),
  });

  constructor(
    private readonly documentService: DocumentService,
    private readonly fb: FormBuilder,
    private readonly iconService: IconService,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService,
    private readonly documentenApiTagService: DocumentenApiTagService
  ) {
    this.iconService.register(TrashCan16);
  }

  public ngOnInit(): void {
    this.openFormValueSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public resetForm(): void {
    this.formGroup.reset();
  }

  private openFormValueSubscription(): void {
    this._subscriptions.add(
      this.formGroup.valueChanges.pipe(debounceTime(500)).subscribe(formValue => {
        this.filterEvent.emit({
          ...(!!formValue.auteur && {auteur: formValue.auteur}),
          ...(!!formValue.titel && {titel: formValue.titel}),
          ...(!!formValue.creatiedatumfrom && {
            creatiedatumfrom: new Date(formValue.creatiedatumfrom).toLocaleDateString(),
          }),
          ...(!!formValue.creatiedatumto && {
            creatiedatumo: new Date(formValue.creatiedatumto).toLocaleDateString(),
          }),
          ...(!!(formValue.vertrouwelijkHeidaanduiding as ListItem)?.id && {
            vertrouwelijkheidaanduiding: (formValue.vertrouwelijkHeidaanduiding as ListItem).id,
          }),
          ...(!!(formValue.informatieObjectType as ListItem)?.id && {
            informatieobjecttype: (formValue.informatieObjectType as ListItem).id,
          }),
          ...(!!formValue.trefwoorden && {
            trefwoorden: (formValue.trefwoorden as ListItem[]).map((tag: ListItem) => tag.content),
          }),
        });
      })
    );
  }
}
