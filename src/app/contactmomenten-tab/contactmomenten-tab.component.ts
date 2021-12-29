/*
 * Copyright 2015-2021 Ritense BV, the Netherlands.
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
import {Contactmoment} from './contactmoment.model';
import {ContactmomentService} from './contactmoment.service';
import * as moment_ from 'moment';
import {TimelineItem, TimelineItemImpl} from '@valtimo/contract';

const moment = moment_;
moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'app-contactmomenten-tab',
  templateUrl: './contactmomenten-tab.component.html',
  styleUrls: ['./contactmomenten-tab.component.scss']
})
export class ContactmomentenTabComponent implements OnInit {

  contactmomenten: Array<TimelineItem> = [];

  constructor(
      private contactmomentService: ContactmomentService,
  ) {
  }

  ngOnInit() {
    this.contactmomentService.getContactmomenten()
    .subscribe(contactmomenten => this.handleContactmomentenResult(contactmomenten));
  }

  private handleContactmomentenResult(contactmomenten: Array<Contactmoment>): void {
    this.contactmomenten = contactmomenten.map(contactmoment => {
      const registratieDatum = moment(contactmoment.registratiedatum);
      return new TimelineItemImpl(
          registratieDatum.format('DD MMM YYYY'),
          registratieDatum.format('HH:mm'),
          contactmoment.medewerkerIdentificatie.achternaam,
          contactmoment.kanaal,
          contactmoment.tekst,
          null
      );
    });
  }
}
