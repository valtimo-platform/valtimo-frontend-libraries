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
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ModalModule} from 'carbon-components-angular';
import {LoggingEvent} from '../../models';

@Component({
  selector: 'valtimo-log-details',
  templateUrl: './log-details.component.html',
  styleUrl: './log-details.component.scss',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogDetailsComponent {
  @Input() public open = false;

  @Input() public set logEvent(logEvent: LoggingEvent) {
    this.logEventFormatted = {
      ...logEvent,
      stacktrace: this.formatStacktrace(logEvent?.stacktrace),
    };
  }

  @Output() public readonly closeModalEvent = new EventEmitter();

  public logEventFormatted: LoggingEvent;

  public readonly packagesToIgnore: string[] = [
    'com.zaxxer',
    'io.micrometer',
    'jakarta',
    'java',
    'jdk',
    'kotlin',
    'org.apache',
    'org.hibernate',
    'org.jboss',
    'org.keycloak',
    'org.postgresql',
    'org.spring',
    'sun.',
  ];
  public readonly classesToIgnore: string[] = [
    'LoggingContextKt',
    'LoggableResourceAspect',
    'RunWithoutAuthorizationAspect',
    'UserLoggingFilter',
  ];

  public onCloseSelect(): void {
    this.closeModalEvent.emit();
  }

  private formatStacktrace(s?: string): string {
    if (!s) {
      return s;
    }

    s = s.replace(/^[^\t].+(Exception|Error): .+/gm, '<span class="highlight1">$&</span>');
    s = s.replace(/^Caused by: .+/gm, '<span class="highlight1">$&</span>');
    this.classesToIgnore.forEach(
      c =>
        (s = s.replace(
          new RegExp(`^\tat .+\.${c}\..+`, 'gm'),
          '<span class="highlight4">$&</span>'
        ))
    );
    this.packagesToIgnore.forEach(
      p => (s = s.replace(new RegExp(`^\tat ${p}.+`, 'gm'), '<span class="highlight4">$&</span>'))
    );
    s = s.replace(/^\tat com.(ritense|valtimo).+/gm, '<span class="highlight2">$&</span>');
    s = s.replace(/^\t.+common frames omitted$/gm, '<span class="highlight4">$&</span>');
    s = s.replace(/com.(ritense|valtimo)[^<\n]+/gm, this.addLinkToValtimoBackendLibraries);
    return s;
  }

  private addLinkToValtimoBackendLibraries(classMatch: string): string {
    const match = classMatch.match(
      /(.*(com\.(ritense|valtimo).+?)\.[A-Z].+?\()([^A-Z]*([A-Z][^.]+)\.([a-z]+):?([0-9]+)?)(.+)/
    );
    if (!match) {
      return classMatch;
    }
    const [all, start, packge, company, linkText, className, ext, lineNr, end] = match;
    const module = LogDetailsComponent.getModule(packge, className);
    const language = ext === 'kt' ? 'kotlin' : ext;
    const classPath = `${packge.replace(/\./g, '/')}`;
    const line = lineNr ? `#L${lineNr}` : '';
    const url = `https://github.com/valtimo-platform/valtimo-backend-libraries/blob/next-minor/${module}/src/main/${language}/${classPath}/${className}.${ext}${line}`;
    const link = `<a href="${url}" target="_blank">${linkText}</a>`;
    return `${start}${link}${end}`;
  }

  private static getModule(packge: string, className: string): string {
    let module = packge.match(/(ritense|valtimo)\.((valtimo\.)?[a-z_]+)/)[2];
    switch (module) {
      case 'processdocument':
        return 'process-document';
      case 'valueresolver':
        return 'value-resolver';
      case 'formflow':
        return 'form-flow';
      case 'valtimo.formflow':
        return 'form-flow-valtimo';
      case 'besluitenapi':
        return 'zgw/besluiten-api';
      case 'catalogiapi':
        return 'zgw/catalogi-api';
      case 'documentenapi':
        return 'zgw/documenten-api';
      case 'notificatiesapi':
        return 'zgw/notificaties-api';
      case 'objectmanagement':
        return 'zgw/object-management';
      case 'objectenapi':
        return 'zgw/objecten-api';
      case 'objecttypenapi':
        return 'zgw/objecttypen-api';
      case 'portaaltaak':
        return 'zgw/portaaltaak';
      case 'verzoek':
        return 'zgw/verzoek';
      case 'zaakdetails':
        return 'zgw/zaakdetails';
      case 'zakenapi':
        return 'zgw/zaken-api';
    }
    switch (packge) {
      case 'com.ritense.valtimo.logging':
      case 'com.ritense.valtimo.service':
        return 'core';
      case 'com.ritense.valtimo.processlink':
        return 'plugin-valtimo';
    }
    switch (className) {
      case 'ResourceStorageDelegate':
      case 'TemporaryResourceStorageService':
        return 'resource/temporary-resource-storage';
    }
    const s = module.split('.');
    return s.length == 2 ? s[1] : s[0];
  }
}
