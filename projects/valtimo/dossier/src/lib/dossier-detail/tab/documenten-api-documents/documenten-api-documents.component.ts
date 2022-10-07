/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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
import {DocumentService, RelatedFile} from '@valtimo/document';
import {DownloadService, ResourceDto, UploadProviderService} from '@valtimo/resource';
import {ToastrService} from 'ngx-toastr';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '@valtimo/config';
import {DocumentenApiMetadata} from '@valtimo/components';
import {UserProviderService} from '@valtimo/security';
import {PromptService} from '@valtimo/user-interface';

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
  public fields = [
    {key: 'fileName', label: 'File name'},
    {key: 'sizeInBytes', label: 'Size in bytes'},
    {key: 'createdOn', label: 'Created on', viewType: 'date'},
    {key: 'createdBy', label: 'Created by'},
  ];
  public actions = [
    {
      columnName: '',
      iconClass: 'mdi mdi-open-in-new',
      callback: this.downloadDocument.bind(this),
    },
    {
      columnName: '',
      iconClass: 'mdi mdi-delete',
      callback: this.removeRelatedFile.bind(this),
    },
  ];
  public isAdmin: boolean;
  public uploadProcessLinkedSet = false;
  public uploadProcessLinked!: boolean;
  readonly uploading$ = new BehaviorSubject<boolean>(false);
  readonly showModal$ = new Subject<null>();
  readonly hideModal$ = new Subject<null>();
  readonly modalDisabled$ = new BehaviorSubject<boolean>(false);
  readonly fileToBeUploaded$ = new BehaviorSubject<File | null>(null);
  private readonly refetch$ = new BehaviorSubject<null>(null);
  public relatedFiles$: Observable<Array<RelatedFile>> = this.refetch$.pipe(
    switchMap(() =>
      combineLatest([
        this.documentService.getDocument(this.documentId),
        this.translateService.stream('key'),
      ])
    ),
    map(([document]) => {
      const relatedFiles = document?.relatedFiles || [];
      const translatedFiles = relatedFiles.map(file => ({
        ...file,
        createdBy: file.createdBy || this.translateService.instant('list.automaticallyGenerated'),
      }));

      return translatedFiles || [];
    })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly toastrService: ToastrService,
    private readonly uploadProviderService: UploadProviderService,
    private readonly downloadService: DownloadService,
    private readonly promptService: PromptService,
    private readonly translateService: TranslateService,
    private readonly configService: ConfigService,
    private readonly userProviderService: UserProviderService
  ) {
    const snapshot = this.route.snapshot.paramMap;
    this.documentId = snapshot.get('documentId') || '';
    this.documentDefinitionName = snapshot.get('documentDefinitionName') || '';
  }

  ngOnInit(): void {
    this.refetchDocuments();
    this.setUploadProcessLinked();
    this.isUserAdmin();
  }

  fileSelected(file: File): void {
    this.fileToBeUploaded$.next(file);
    this.showModal$.next(null);
  }

  downloadDocument(relatedFile: RelatedFile): void {
    this.uploadProviderService
      .getResource(relatedFile.fileId)
      .subscribe((resource: ResourceDto) => {
        this.downloadService.downloadFile(resource.url, resource.resource.name);
      });
  }

  removeRelatedFile(relatedFile: RelatedFile) {
    this.promptService.openPrompt({
      headerText: this.translateService.instant('dossier.deleteConfirmation.title'),
      bodyText: this.translateService.instant('dossier.deleteConfirmation.description'),
      cancelButtonText: this.translateService.instant('dossier.deleteConfirmation.cancel'),
      confirmButtonText: this.translateService.instant('dossier.deleteConfirmation.delete'),
      cancelMdiIcon: 'cancel',
      confirmMdiIcon: 'delete',
      cancelButtonType: 'secondary',
      confirmButtonType: 'primary',
      closeOnConfirm: true,
      closeOnCancel: true,
      confirmCallBackFunction: () => {
        this.documentService.removeResource(this.documentId, relatedFile.fileId).subscribe(
          () => {
            this.toastrService.success('Successfully removed document from dossier');
            this.refetchDocuments();
          },
          () => {
            this.toastrService.error('Failed to remove document from dossier');
          }
        );
      },
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
}
