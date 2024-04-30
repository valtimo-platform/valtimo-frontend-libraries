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
import {debounceTime, filter, map, Observable, Subscription, switchMap} from 'rxjs';
import {DocumentenApiFilterModel} from '../../models';
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

  public readonly confidentialityLevels$: Observable<ListItem[]> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this._confidentialityLevels.map((confidentialityLevel: ConfidentialityLevel) => ({
          content: this.translateService.instant(`document.${confidentialityLevel}`),
          selected: false,
          id: confidentialityLevel,
        }))
      )
    );

  public readonly informationObjectTypes$: Observable<ListItem[]> = this.route.paramMap.pipe(
    filter((paramMap: ParamMap) => !!paramMap.get('documentDefinitionName')),
    switchMap((paramMap: ParamMap) =>
      this.documentService.getDocumentTypes(paramMap.get('documentDefinitionName') ?? '')
    ),
    map((types: DocumentType[]) =>
      types.map((type: DocumentType) => ({content: type.name, selected: false, id: type.url}))
    )
  );

  public readonly tags$: Observable<ListItem[]> = this.route.paramMap.pipe(
    filter((paramMap: ParamMap) => !!paramMap.get('documentDefinitionName')),
    switchMap((paramMap: ParamMap) =>
      this.documentenApiTagService.getTags(paramMap.get('documentDefinitionName') ?? '')
    ),
    map((tags: string[]) => tags.map((tag: string) => ({content: tag, selected: false})))
  );

  public readonly formGroup = this.fb.group({
    author: this.fb.control(''),
    confidentialityLevel: this.fb.control({}),
    creationDateFrom: this.fb.control(''),
    creationDateTo: this.fb.control(''),
    informationObjectType: this.fb.control({}),
    tags: this.fb.control([]),
    title: this.fb.control(''),
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
    this._subscriptions.add(
      this.formGroup.valueChanges.pipe(debounceTime(500)).subscribe(formValue => {
        this.filterEvent.emit({
          ...(!!formValue.author && {author: formValue.author}),
          ...(!!formValue.title && {title: formValue.title}),
          ...(!!formValue.creationDateFrom && {
            creationDateFrom: new Date(formValue.creationDateFrom),
          }),
          ...(!!formValue.creationDateTo && {
            creationDateTo: new Date(formValue.creationDateTo),
          }),
          ...(!!(formValue.confidentialityLevel as ListItem).id && {
            confidentialityLevel: (formValue.confidentialityLevel as ListItem).id,
          }),
          ...(!!(formValue.informationObjectType as ListItem).id && {
            informationObjectType: (formValue.informationObjectType as ListItem).id,
          }),
          ...(!!formValue.tags && {
            tags: (formValue.tags as ListItem[]).map((tag: ListItem) => tag.content),
          }),
        });
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public resetForm(): void {
    this.formGroup.reset();
  }
}
