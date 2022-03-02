import {Injector} from '@angular/core';
import {Components, Formio} from 'angular-formio';
import {DocumentService, RelatedFile} from '@valtimo/document';
import {map} from 'rxjs/operators';

const SelectComponent = Components.components.select;

export function registerFormioFileSelectorComponent(injector: Injector) {

  var documentService = injector.get(DocumentService)

  function getResources() {
    return documentService.getDocument("7951f824-2fa5-429f-93f8-a60471a9c511")
      .toPromise()
      .then(document => document.relatedFiles
        .map(relatedFile => {
          return {
            label: relatedFile.fileName,
            value: relatedFile.fileId
          };
        })
      )
  };

  class ResourceSelectorComponent extends SelectComponent {
    static schema(...extend) {
      return SelectComponent.schema({
        type: 'resource-selector',
        label: 'Resource selector',
        key: 'resource-selector',
        dataSrc: 'custom',
        asyncValues: true,
        data: {
          custom: getResources()
        },
        ...extend
      });
    }

    static get builderInfo() {
      return {
        title: 'Resource selector',
        icon: 'terminal',
        group: 'basic',
        documentation: '/userguide/#textfield',
        weight: 0,
        schema: ResourceSelectorComponent.schema()
      };
    }
  }

  Formio.use({
    components: {
      'resource-selector': ResourceSelectorComponent
    }
  })
}
