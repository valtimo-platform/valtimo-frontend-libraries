import {Injector} from '@angular/core';
import {Components, Formio} from 'angular-formio';
import {DocumentService} from '@valtimo/document';
import {FormIoStateService} from '../services/form-io-state.service';
import {take} from 'rxjs/operators';

const SelectComponent = Components.components.select;

export function registerFormioFileSelectorComponent(injector: Injector) {
  var documentService = injector.get(DocumentService);
  var stateService = injector.get(FormIoStateService);

  const unavailableMessage: ResourceOption = {
    label: 'could not retrieve documents',
    value: null,
  };

  function getDocumentResources(documentId: string): Promise<ResourceOption[]> {
    if (!documentId) {
      return new Promise(resolve => {
        resolve([unavailableMessage]);
      });
    }
    return documentService
      .getDocument(documentId)
      .toPromise()
      .then(document =>
        document.relatedFiles.map(relatedFile => {
          return {
            label: relatedFile.fileName,
            value: relatedFile.fileId,
          };
        })
      )
      .catch(() => {
        return new Promise(resolve => {
          resolve([unavailableMessage]);
        });
      });
  }

  interface ResourceOption {
    label: string;
    value: string;
  }

  class ResourceSelectorComponent extends SelectComponent {
    static schema(...extend) {
      return SelectComponent.schema({
        type: 'resource-selector',
        label: 'Resource selector',
        key: 'resource-selector',
        dataSrc: 'custom',
        dataType: 'string',
        valueProperty: 'value',
        asyncValues: true,
        data: {
          custom: 'values = instance.getResources()',
        },
        ...extend,
      });
    }

    getResources() {
      return stateService.documentId$
        .pipe(take(1))
        .toPromise()
        .then(documentId => getDocumentResources(documentId));
    }

    static get builderInfo() {
      return {
        title: 'Resource selector',
        icon: 'terminal',
        group: 'basic',
        documentation: '/userguide/#textfield',
        weight: 0,
        schema: ResourceSelectorComponent.schema(),
      };
    }
  }

  Formio.use({
    components: {
      'resource-selector': ResourceSelectorComponent,
    },
  });
}
