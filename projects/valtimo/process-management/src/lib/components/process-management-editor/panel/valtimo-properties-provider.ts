import {useService} from 'bpmn-js-properties-panel';
import {html} from 'htm/preact';
import {is} from 'bpmn-js/lib/util/ModelUtil';
import {ProcessManagementEditorService} from '../../../services';
import {BpmnElement, ProcessManagementWindow} from '../../../models';
import {ProcessLink} from '@valtimo/process-link';
import {TranslateService} from '@ngx-translate/core';

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


    return (groups: any[]) => {
      if (
        is(element, 'bpmn:UserTask') ||
        is(element, 'bpmn:StartEvent') ||
        is(element, 'bpmn:ServiceTask')
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
      id: 'customRootElement',
      processLink,
      element,
      component: CustomRootElement,
      isEdited: () => false,
    };
  }
}

const CustomRootElement = (props: any): any => {
  const {element, processLink, translateService} = props;
  const modeling = useService('modeling');
  const editProcessLinkText = translateService.instant('interface.edit')
  const unlinkText = translateService.instant('processLink.unlink')
  const createText = translateService.instant('processLink.create')
  console.log("process link", processLink)

  const handleClick = () => {
    // trigger update
    modeling.updateProperties(element, {});
  };

  return processLink ? html`
  <div class="process-link-properties-panel">
    <button class="cds--btn cds--btn--primary cds--btn--md cds--layout--size-md" onClick=${handleClick}>${editProcessLinkText}</button>
    <button class="cds--btn cds--btn--danger cds--btn--md cds--layout--side-md" onClick=${handleClick}>${unlinkText}</button>
  </div>` : html`
  <div class="process-link-properties-panel">
    <button class="cds--btn cds--btn--primary cds--btn--md cds--layout--size-md" onClick=${handleClick}>${createText}</button>
  </div>`
}

const valtimoPropertiesProviderModule = {
  __init__: ['customPropertiesProvider'],
  customPropertiesProvider: ['type', ValtimoPropertiesProvider],
};

export {valtimoPropertiesProviderModule};
