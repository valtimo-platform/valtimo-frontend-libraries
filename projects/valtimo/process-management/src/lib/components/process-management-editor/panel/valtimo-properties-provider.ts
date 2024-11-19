import {useService} from 'bpmn-js-properties-panel';
import {html} from 'htm/preact';
import {is} from 'bpmn-js/lib/util/ModelUtil';
import {ProcessManagementEditorService} from '../../../services';
import {ProcessManagementWindow} from '../../../models';

class ValtimoPropertiesProvider {
  static $inject = ['propertiesPanel', 'translate'];

  private get processManagementEditorService(): ProcessManagementEditorService {
    return (window as any as ProcessManagementWindow).processManagementEditorService;
  }

  constructor(propertiesPanel: any, translate: any) {
    propertiesPanel.registerProvider(500, this);
  }

  public getGroups(element: any): (groups: any[]) => any[] {
    console.log('x', this.processManagementEditorService.processLinksForSelectedDefinition);

    return (groups: any[]) => {
      if (
        is(element, 'bpmn:UserTask') ||
        is(element, 'bpmn:StartEvent') ||
        is(element, 'bpmn:ServiceTask')
      ) {
        const customGroup = {
          id: 'customRootGroup',
          label: 'Process link',
          entries: [this.createCustomButton(element)],
          groupType: 'root', // Mark this group as root level
        };
        groups.unshift(customGroup); // Add to the top of the panel
      }
      return groups;
    };
  }

  public createCustomButton(element: any): any {
    return {
      id: 'customRootButton',
      element,
      component: CustomButton,
      isEdited: () => false,
    };
  }
}

function CustomButton(props: any): any {
  const {element} = props;
  const modeling = useService('modeling');
  const translate = useService('translate');

  const handleClick = () => {
    console.log(`Custom action triggered for element: ${element.id}`);
    modeling.updateProperties(element, {customProperty: 'newValue'});
  };

  return html`<button id="customRootButton" onClick=${handleClick}>test</button> `;
}

const valtimoPropertiesProviderModule = {
  __init__: ['customPropertiesProvider'],
  customPropertiesProvider: ['type', ValtimoPropertiesProvider],
};

export {valtimoPropertiesProviderModule};
