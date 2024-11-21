import {useService} from 'bpmn-js-properties-panel';
import {html} from 'htm/preact';
import {is} from 'bpmn-js/lib/util/ModelUtil';
import {ProcessManagementEditorService} from '../../../services';
import {BpmnElement, OpenProcessLinkModalEvent, ProcessManagementWindow} from '../../../models';
import {ModalParams, ProcessLink} from '@valtimo/process-link';
import {TranslateService} from '@ngx-translate/core';
import {mapActivityTypeToActivityListenerType} from '../../../utils';

class ValtimoPropertiesProvider {
  static $inject = ['propertiesPanel', 'translate'];

  private get processManagementEditorService(): ProcessManagementEditorService {
    return (window as any as ProcessManagementWindow).processManagementEditorService;
  }

  private get translateService(): TranslateService {
    return (window as any as ProcessManagementWindow).translateService;
  }

  constructor(propertiesPanel: any) {
    propertiesPanel.registerProvider(500, this);
  }

  public getGroups(element: BpmnElement): (groups: any[]) => any[] {
    const processLink: ProcessLink | null =
      this.processManagementEditorService.processLinksForSelectedDefinition.find(
        processLink => processLink.activityId === element.id
      ) || null;

    console.log('element as in', element);

    return (groups: any[]) => {
      // process links are possible for these process elements
      if (
        is(element, 'bpmn:UserTask') ||
        is(element, 'bpmn:StartEvent') ||
        is(element, 'bpmn:ServiceTask') ||
        is(element, 'bpmn:CallActivity')
      ) {
        const customGroup = {
          id: 'customRootGroup',
          label: 'Process link',
          entries: [this.createCustomRootElement(element, processLink)],
          groupType: 'root', // Mark this group as root level
        };
        groups.unshift(customGroup); // Add to the top of the panel
      }
      return groups;
    };
  }

  public createCustomRootElement(element: any, processLink: ProcessLink | null): any {
    return {
      translateService: this.translateService,
      processManagementEditorService: this.processManagementEditorService,
      id: 'customRootElement',
      processLink,
      element,
      component: CustomRootElement,
      isEdited: () => false,
    };
  }
}

const CustomRootElement = (props: {
  translateService: TranslateService;
  processManagementEditorService: ProcessManagementEditorService;
  id: string;
  processLink: ProcessLink;
  element: BpmnElement;
}): any => {
  const {element, processLink, translateService, processManagementEditorService} = props;
  const modeling = useService('modeling');
  const editProcessLinkText = translateService.instant('interface.edit');
  const unlinkText = translateService.instant('processLink.unlink');
  const createText = translateService.instant('processLink.create');
  console.log('process link', processLink);

  const modalParams: ModalParams = {
    processDefinitionKey: processManagementEditorService.selectionProcessDefinition.key,
    processDefinitionId: processManagementEditorService.selectionProcessDefinition.id,
    element: {
      id: element.id,
      type: element.type,
      activityListenerType: mapActivityTypeToActivityListenerType(element.type),
      name: element.di.bpmnElement.name,
    },
  };

  const handleCreateClick = () => {
    const event: OpenProcessLinkModalEvent = {
      modalParams,
    };

    processManagementEditorService.sendOpenProcessLinkModalEvent(event, () => {
      modeling.updateProperties(element, {});
    });
  };

  const handleEditClick = () => {
    const event: OpenProcessLinkModalEvent = {
      processLink,
      modalParams,
    };

    processManagementEditorService.sendOpenProcessLinkModalEvent(event, () => {
      modeling.updateProperties(element, {});
    });
  };

  const handleUnlinkClick = () => {
    processManagementEditorService.deleteProcessLink({processLinkId: processLink.id}, () => {
      modeling.updateProperties(element, {});
    });
  };

  return processLink
    ? html`<div class="process-link-properties-panel">
        <button
          class="cds--btn cds--btn--primary cds--btn--md cds--layout--size-md"
          onClick=${handleEditClick}
        >
          ${editProcessLinkText}
        </button>
        <button
          class="cds--btn cds--btn--danger cds--btn--md cds--layout--side-md"
          onClick=${handleUnlinkClick}
        >
          ${unlinkText}
        </button>
      </div>`
    : html`<div class="process-link-properties-panel">
        <button
          class="cds--btn cds--btn--primary cds--btn--md cds--layout--size-md"
          onClick=${handleCreateClick}
        >
          ${createText}
        </button>
      </div>`;
};

const valtimoPropertiesProviderModule = {
  __init__: ['customPropertiesProvider'],
  customPropertiesProvider: ['type', ValtimoPropertiesProvider],
};

export {valtimoPropertiesProviderModule};
