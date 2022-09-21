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

import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalComponent, ModalService, SelectItem} from '@valtimo/user-interface';
import {BehaviorSubject, map, Observable, Subscription, switchMap, tap} from 'rxjs';
import {
  ConfidentialityLevel,
  DocumentenApiMetadata,
  DocumentLanguage,
  DocumentStatus,
} from '../../models';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '@valtimo/document';

@Component({
  selector: 'valtimo-documenten-api-metadata-modal',
  templateUrl: './documenten-api-metadata-modal.component.html',
  styleUrls: ['./documenten-api-metadata-modal.component.scss'],
})
export class DocumentenApiMetadataModalComponent implements OnInit, OnDestroy {
  @ViewChild('documentenApiMetadataModal') documentenApiMetadataModal: ModalComponent;

  @Input() show$!: Observable<null>;
  @Input() hide$!: Observable<null>;
  @Input() disabled$!: Observable<boolean>;
  @Input() file$!: Observable<File>;

  readonly CONFIDENTIALITY_LEVELS: Array<ConfidentialityLevel> = [
    'openbaar',
    'beperkt_openbaar',
    'intern',
    'zaakvertrouwelijk',
    'vertrouwelijk',
    'confidentieel',
    'geheim',
    'zeer_geheim',
  ];
  readonly confidentialityLevelItems$: Observable<Array<SelectItem>> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this.CONFIDENTIALITY_LEVELS.map(confidentialityLevel => ({
          id: confidentialityLevel,
          text: this.translateService.instant(`document.${confidentialityLevel}`),
        }))
      )
    );
  readonly STATUSES: Array<DocumentStatus> = [
    'in_bewerking',
    'ter_vaststelling',
    'definitief',
    'gearchiveerd',
  ];
  readonly statusItems$: Observable<Array<SelectItem>> = this.translateService.stream('key').pipe(
    map(() =>
      this.STATUSES.map(status => ({
        id: status,
        text: this.translateService.instant(`document.${status}`),
      }))
    )
  );
  readonly LANGUAGES: Array<DocumentLanguage> = ['nld', 'eng', 'deu'];
  readonly languageItems$: Observable<Array<SelectItem>> = this.translateService.stream('key').pipe(
    map(() =>
      this.LANGUAGES.map(language => ({
        id: language,
        text: this.translateService.instant(`document.${language}`),
      }))
    )
  );
  readonly documentTypeItems$: Observable<Array<SelectItem>> = this.route.params.pipe(
    tap(routeParams => console.log(routeParams)),
    switchMap(params => this.documentService.getDocumentTypes(params.documentDefinitionName)),
    map(documentTypes => documentTypes.map(type => ({id: type.url, text: type.name})))
  );
  readonly showForm$: Observable<boolean> = this.modalService.modalVisible$;
  readonly valid$ = new BehaviorSubject<boolean>(false);
  private showSubscription!: Subscription;
  private hideSubscription!: Subscription;

  constructor(
    private readonly modalService: ModalService,
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.openShowSubscription();
    this.openHideSubscription();
  }

  ngOnDestroy(): void {
    this.showSubscription?.unsubscribe();
    this.hideSubscription?.unsubscribe();
  }

  hide(): void {
    this.modalService.closeModal();
  }

  cancel(): void {
    console.log('cancel');
  }

  save(): void {
    console.log('save');
  }

  formValueChange(data: DocumentenApiMetadata): void {
    this.setValid(data);
  }

  private setValid(data: DocumentenApiMetadata): void {
    this.valid$.next(
      !!(
        data.filename &&
        data.title &&
        data.author &&
        data.creationDate &&
        data.status &&
        data.language &&
        data.informatieobjecttype
      )
    );
  }

  private openShowSubscription(): void {
    this.showSubscription = this.show$.subscribe(() => {
      this.modalService.openModal(this.documentenApiMetadataModal);
    });
  }

  private openHideSubscription(): void {
    this.hideSubscription = this.hide$.subscribe(() => {
      this.hide();
    });
  }
}
