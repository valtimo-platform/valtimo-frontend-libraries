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

import {AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild,} from '@angular/core';
import {DocumentenApiColumnModalTypeCloseEvent,} from '../../models';
import {BehaviorSubject, combineLatest, filter, map, Observable, Subject, switchMap, tap,} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {
  ActionItem,
  CarbonListModule,
  ColumnConfig,
  ConfirmationModalModule,
  Pagination,
  PendingChangesComponent,
  ViewType,
} from '@valtimo/components';
import {DocumentenApiColumnModalComponent} from '../documenten-api-column-modal/documenten-api-column-modal.component';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule, TagModule} from 'carbon-components-angular';
import {DocumentenApiTagService} from '../../services/documenten-api-tag.service';
import {DocumentenApiTag} from '../../models/documenten-api-tag.model';
import {DocumentenApiTagModalComponent} from '../documenten-api-tag-modal/documenten-api-tag-modal.component';
import {DocumentDefinition, Page} from '@valtimo/document';
import moment from 'moment/moment';

@Component({
  selector: 'valtimo-documenten-api-tags',
  templateUrl: './documenten-api-tags.component.html',
  styleUrls: ['./documenten-api-tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DocumentenApiColumnModalComponent,
    CarbonListModule,
    TranslateModule,
    ConfirmationModalModule,
    TagModule,
    ButtonModule,
    DocumentenApiTagModalComponent,
  ],
})
export class DocumentenApiTagsComponent
  extends PendingChangesComponent
  implements AfterViewInit
{
  @ViewChild('colorColumnTemplate') colorColumnTemplate: TemplateRef<any>;

  private readonly _reload$ = new BehaviorSubject<null | 'noAnimation'>(null);

  private readonly _documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params?.name),
    filter(docDefName => !!docDefName)
  );

  public get documentDefinitionName$(): Observable<string> {
    return this._documentDefinitionName$;
  }

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  public readonly documentTags$: Observable<DocumentenApiTag[]> = combineLatest([
    this._documentDefinitionName$,
    this._reload$,
  ]).pipe(
    tap(([_, reload]) => {
      if (reload === null) {
        this.loading$.next(true);
      }
    }),
    switchMap(([documentDefinitionName]) =>
      this.documentenApiTagService.getTagsForAdmin(
        documentDefinitionName,
        {
          page: this.pagination.page - 1,
          size: this.pagination.size,
        }
      )
    ),
    map((tagPage: Page<DocumentenApiTag>) => {
      this.pagination = {
        ...this.pagination,
        collectionSize: tagPage.totalElements,
      };

      return tagPage.content;
    }),
    tap(tags => {
      this.loading$.next(false);
    })
  );

  public readonly fields$ = new BehaviorSubject<ColumnConfig[]>([]);

  public readonly ACTION_ITEMS: ActionItem[] = [
    {
      label: 'interface.delete',
      callback: this.openDeleteModal.bind(this),
      type: 'danger',
    },
  ];

  public readonly CARBON_THEME = 'g10';

  public readonly addModalClosed$ = new BehaviorSubject<boolean>(true);
  public readonly showDisableModal$ = new Subject<boolean>();

  public pagination: Pagination = {
    collectionSize: 0,
    page: 1,
    size: 10,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentenApiTagService: DocumentenApiTagService
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    this.initFields();
  }

  public openDeleteModal(tag: DocumentenApiTag): void {
    this.showDisableModal$.next(true);
  }

  public openAddModal(): void {
    this.addModalClosed$.next(false);
  }

  public closeModal(closeModalEvent: DocumentenApiColumnModalTypeCloseEvent): void {
    if (closeModalEvent === 'closeAndRefresh') {
      this.reload();
    }
    this.addModalClosed$.next(true);
  }

  public paginationClicked(page: number): void {
    this.pagination = {...this.pagination, page};
    this.reload();
  }

  public paginationSet(size: number): void {
    this.pagination = {...this.pagination, size};
    this.reload();
  }

  public confirmDeleteStatus(tag: DocumentenApiTag): void {
    this.documentDefinitionName$
      .pipe(
        switchMap(documentDefinitionName =>
          this.documentenApiTagService.deleteTag(documentDefinitionName, tag.value)
        )
      )
      .subscribe(() => {
        this.reload();
      });
  }

  private reload(noAnimation = false): void {
    this._reload$.next(noAnimation ? 'noAnimation' : null);
  }

  private initFields(): void {
    this.fields$.next([
      {
        key: 'value',
        label: 'title-goes-here',
        viewType: ViewType.TEXT,
      }
    ]);
  }
}
