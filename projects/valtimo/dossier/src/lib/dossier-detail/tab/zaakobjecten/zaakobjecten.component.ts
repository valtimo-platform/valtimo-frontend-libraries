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

import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ZaakobjectenService} from '../../../services/zaakobjecten.service';
import {of, switchMap, tap} from 'rxjs';

@Component({
  selector: 'valtimo-dossier-detail-tab-zaakobjecten',
  templateUrl: './zaakobjecten.component.html',
  styleUrls: ['./zaakobjecten.component.scss'],
})
export class DossierDetailTabZaakobjectenComponent {
  objecttypes$ = this.route.params.pipe(
    switchMap(params => this.zaakobjectenService.getDocumentObjectTypes(params.documentId))
  );

  objects$ = this.zaakobjectenService.getDocumentObjectsOfType(
    'c7036c9a-fc1d-4fe9-b8ee-05a1e4faf9d1',
    'http://host.docker.internal:8011/api/v1/objecttypes/3a82fb7f-fc9b-4104-9804-993f639d6d0d'
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly zaakobjectenService: ZaakobjectenService
  ) {}
}
