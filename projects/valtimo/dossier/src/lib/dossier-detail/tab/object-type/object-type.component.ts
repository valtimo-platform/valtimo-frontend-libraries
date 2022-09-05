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

import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ZaakobjectenService} from '../../../services/zaakobjecten.service';
import {combineLatest, BehaviorSubject, map, Observable, of, switchMap, tap} from 'rxjs';
import {ZaakObject, ZaakObjectType} from '../../../models';
import {SelectItem, TableColumn} from '@valtimo/user-interface';
import {ConfigService} from '@valtimo/config';

@Component({
  selector: 'valtimo-object-type',
  templateUrl: './object-type.component.html',
  styleUrls: ['./object-type.component.css'],
})
export class DossierDetailTabObjectTypeComponent {
  @Input() typeObject;
  private readonly documentId$ = this.route.params.pipe(map(params => params.documentId));

  private readonly objecttypes$: Observable<Array<ZaakObjectType>> = this.documentId$.pipe(
    switchMap(documentId => this.zaakobjectenService.getDocumentObjectTypes(documentId))
  );

  readonly objecttypeSelectItems$: Observable<Array<SelectItem>> = this.objecttypes$.pipe(
    map(objecttypes => objecttypes.map(type => ({id: type.url, text: type.name || '-'})))
  );

  readonly selectedObjecttypeUrl$ = new BehaviorSubject<string | null>(null);

  readonly objects$: Observable<Array<ZaakObject> | null> = combineLatest([
    this.documentId$,
    this.selectedObjecttypeUrl$,
  ]).pipe(
    switchMap(([documentId, selectedObjecttypeUrl]) =>
      documentId && selectedObjecttypeUrl
        ? this.zaakobjectenService
            .getDocumentObjectsOfType(documentId, selectedObjecttypeUrl)
            .pipe(map(objects => objects.map(object => ({...object, title: object.title || '-'}))))
        : of(null)
    )
  );

  readonly columns$ = new BehaviorSubject<Array<TableColumn>>([
    {
      labelTranslationKey: 'dossier.zaakobjecten.index',
      dataKey: 'index',
    },
    {
      labelTranslationKey: 'dossier.zaakobjecten.registrationAt',
      dataKey: 'registrationAt',
    },
    {
      labelTranslationKey: 'dossier.zaakobjecten.title',
      dataKey: 'title',
    },
  ]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly zaakobjectenService: ZaakobjectenService,
    private readonly configService: ConfigService
  ) {
    this.selectObjectType();
  }

  selectObjectType(): void {
    this.selectedObjecttypeUrl$.next(
      'http://host.docker.internal:8011/api/v1/objecttypes/feeaa795-d212-4fa2-bb38-2c34996e5702'
    );
  }
}
