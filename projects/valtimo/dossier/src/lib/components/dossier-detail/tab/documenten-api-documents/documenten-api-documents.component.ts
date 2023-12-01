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

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentService, RelatedFile, RelatedFileListItem} from '@valtimo/document';
import {DownloadService, UploadProviderService} from '@valtimo/resource';
import {ToastrService} from 'ngx-toastr';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '@valtimo/config';
import {DocumentenApiMetadata, PromptService} from '@valtimo/components';
import {UserProviderService} from '@valtimo/security';
import {FileSortService} from '../../../../services/file-sort.service';
import moment from 'moment';
import {Filter16, TagGroup16, Upload16} from "@carbon/icons";
import {IconService} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-dossier-detail-tab-documenten-api-documents',
  templateUrl: './documenten-api-documents.component.html',
  styleUrls: ['./documenten-api-documents.component.scss'],
})
export class DossierDetailTabDocumentenApiDocumentsComponent implements OnInit {
  public readonly documentId: string;
  public readonly documentDefinitionName: string;
  public readonly maxFileSize: number = this.configService?.config?.caseFileSizeUploadLimitMB || 5;
  public readonly acceptedFiles: string =
    this.configService?.config?.caseFileUploadAcceptedFiles || null;
  public fieldsConfig = ['title', 'informatieobjecttype', 'status', 'format', 'confidentialityLevel', 'trefwoorden'];
  public fields = this.getFields(this.fieldsConfig);

  public tableConfig = {
    searchable: true
  }

  public showZaakLinkWarning: boolean;
  public isAdmin: boolean;
  public uploadProcessLinkedSet = false;
  public uploadProcessLinked!: boolean;
  readonly uploading$ = new BehaviorSubject<boolean>(false);
  readonly showModal$ = new Subject<null>();
  readonly hideModal$ = new Subject<null>();
  readonly modalDisabled$ = new BehaviorSubject<boolean>(false);
  readonly fileToBeUploaded$ = new BehaviorSubject<File | null>(null);
  readonly loading$ = new BehaviorSubject<boolean>(true);
  private readonly refetch$ = new BehaviorSubject<null>(null);

  public relatedFiles$: Observable<Array<RelatedFileListItem>> = this.refetch$.pipe(
    switchMap(() =>
      combineLatest([
        this.documentService.getZakenApiDocuments(this.documentId),
        this.translateService.stream('key'),
      ])
    ),
    map(([relatedFiles]) => {
      console.log('>> relatedFiles: ', relatedFiles);
      const translatedFiles = relatedFiles?.map(file => ({
        ...file,
        createdBy: file.createdBy || this.translateService.instant('list.automaticallyGenerated'),
        language: this.translateService.instant(`document.${file.language}`),
        confidentialityLevel: this.translateService.instant(`document.${file.confidentialityLevel}`),
        status: this.translateService.instant(`document.${file.status}`),
        format: this.translateService.instant(`document.${file.format}`)
      }));
      console.log('translatedFiles: ', translatedFiles);
      return translatedFiles || [];
    }),
    map(relatedFiles => this.fileSortService.sortRelatedFilesByDateDescending(relatedFiles)),
    map(relatedFiles => {
      moment.locale(this.translateService.currentLang);
      console.log('relatedFiles: ', relatedFiles);
      return relatedFiles.map(file => ({
        ...file,
        createdOn: moment(new Date(file.createdOn)).format('L'),
        size: `${this.bytesToMegabytes(file.sizeInBytes)}`
      }));
    }),
    tap(() => this.loading$.next(false)),
    catchError(() => {
      this.showZaakLinkWarning = true;
      return of([]);
    })
  );

  readonly downloadingFileIndexes$ = new BehaviorSubject<Array<number>>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly toastrService: ToastrService,
    private readonly uploadProviderService: UploadProviderService,
    private readonly downloadService: DownloadService,
    private readonly promptService: PromptService,
    private readonly translateService: TranslateService,
    private readonly configService: ConfigService,
    private readonly userProviderService: UserProviderService,
    private readonly fileSortService: FileSortService,
    protected iconService: IconService
  ) {
    const snapshot = this.route.snapshot.paramMap;
    this.documentId = snapshot.get('documentId') || '';
    this.documentDefinitionName = snapshot.get('documentDefinitionName') || '';
  }

  ngOnInit(): void {
    this.refetchDocuments();
    this.setUploadProcessLinked();
    this.isUserAdmin();
    this.iconService.register(Filter16);
    this.iconService.register(TagGroup16);
    this.iconService.register(Upload16);
  }

  fileSelected(file: File): void {
    console.log('file: ', file);
    this.fileToBeUploaded$.next(file);
    this.showModal$.next(null);
  }

  downloadDocument(relatedFile: RelatedFile, index: number): void {
    this.downloadingFileIndexes$.pipe(take(1)).subscribe(indexes => {
      this.downloadingFileIndexes$.next([...indexes, index]);

      const finished$: Observable<null> = this.downloadService.downloadFile(
        `/api/v1/documenten-api/${relatedFile.pluginConfigurationId}/files/${relatedFile.fileId}/download`,
        relatedFile.fileName
      );

      finished$.pipe(take(1)).subscribe(() => {
        this.downloadingFileIndexes$.next(
          this.downloadingFileIndexes$.getValue().filter(downloadIndex => downloadIndex !== index)
        );
      });
    });
  }

  metadataSet(metadata: DocumentenApiMetadata): void {
    this.uploading$.next(true);
    this.hideModal$.next(null);

    this.fileToBeUploaded$
      .pipe(take(1))
      .pipe(
        tap(file => {
          this.uploadProviderService
            .uploadFileWithMetadata(file, this.documentId, metadata)
            .subscribe(res => {
              this.refetchDocuments();
              this.uploading$.next(false);
              this.fileToBeUploaded$.next(null);
            });
        })
      )
      .subscribe();
  }

  indexesIncludeIndex(indexes: Array<number>, index: number): boolean {
    return indexes.includes(index);
  }

  public isUserAdmin() {
    this.userProviderService.getUserSubject().subscribe(
      userIdentity => {
        this.isAdmin = userIdentity.roles.includes('ROLE_ADMIN');
      },
      error => {
        this.isAdmin = false;
      }
    );
  }

  private refetchDocuments(): void {
    this.refetch$.next(null);
  }

  private setUploadProcessLinked(): void {
    this.uploadProviderService.checkUploadProcessLink(this.documentDefinitionName).subscribe(
      linked => {
        this.uploadProcessLinked = linked;
        this.uploadProcessLinkedSet = true;
      },
      () => {
        this.uploadProcessLinkedSet = true;
      }
    );
  }

  private bytesToMegabytes(bytes: number): string {
    const megabytes = bytes / (1024 * 1024);
    if (megabytes < .01) {
      return '< 0.01 MB';
    } else if (megabytes < 1000) {
      return megabytes.toFixed(2) + ' MB';
    } else {
      return (megabytes/1000).toFixed(2) + ' GB';
    }
  }

  private getFields(fieldsConfig) {
    const fields = [{key: 'title', label: 'document.inputTitle'},
      {key: 'fileName', label: 'document.filename'},
      {key: 'format', label: 'document.format'},
      {key: 'description', label: 'document.inputDescription'},
      {key: 'size', label: 'document.size'},
      {key: 'createdOn', label: 'document.createdOn'},
      {key: 'createdBy', label: 'document.createdBy'},
      {key: 'author', label: 'document.author'},
      {key: 'keywords', label: 'document.trefwoorden'},
      {key: 'informatieobjecttype', label: 'document.informatieobjecttype'},
      {key: 'language', label: 'document.language'},
      {key: 'identification', label: 'document.id'},
      {key: 'confidentialityLevel', label: 'document.confidentialityLevel'},
      {key: 'receiptDate', label: 'document.receiptDate'},
      {key: 'sendDate', label: 'document.sendDate'},
      {key: 'status', label: 'document.status'}
    ];
    return fields.filter(field => {
      return fieldsConfig.includes(field.key)
    });
  }
}
