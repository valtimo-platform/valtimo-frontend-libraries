import {is} from 'bpmn-js/lib/util/ModelUtil';
import {PropertiesPanel, useService} from 'bpmn-js-properties-panel';
import {isTextFieldEntryEdited, TextFieldEntry} from '@bpmn-io/properties-panel';
import {html} from 'htm/preact';
import {ModalService} from '@valtimo/components';
import {tap} from 'rxjs';
import {ProcessLinkService, ProcessLinkStateService} from '@valtimo/process-link/index';

export class PropertyPanelCustomizer {
  private LOW_PRIORITY = 500;

  public static $inject = ['propertiesPanel', 'translate'];

  constructor(
    private readonly propertiesPanel: PropertiesPanel,
    private readonly translate: Function,
    private readonly modalService: ModalService,
  ) {
    propertiesPanel.registerProvider(this.LOW_PRIORITY, this);
  }

  public getGroups(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    const parent = this;
    return function(groups) {

      // Add the "magic" group
      //if (is(element, 'bpmn:StartEvent')) {
      groups.push(parent.createMagicGroup(element, parent.translate));
      //}

      return groups;
    };
  }

  createMagicGroup(element, translate) {

    // create a group called "Magic properties".
    return {
      id: 'magic',
      label: translate('Magic properties'),
      entries: [
        {
          id: 'spell',
          element,
          component: this.Spell,
          isEdited: isTextFieldEntryEdited
        },
        {
          id: 'linkProcessButton',
          element,
          component: this.ProcessLink,
          isEdited: isTextFieldEntryEdited
        }
      ],
      tooltip: translate('Make sure you know what you are doing!')
    };
  }

  private Spell(element: any, id: any) {

    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');

    const getValue = () => {
      return element.element.businessObject.spell || '';
    };

    const setValue = value => {
      return modeling.updateProperties(element.element, {
        spell: value
      });
    };

    return html`<${TextFieldEntry}
    id=${ id }
    element=${ element }
    description=${ translate('Apply a black magic spell') }
    label=${ translate('Spell') }
    getValue=${ getValue }
    setValue=${ setValue }
    debounce=${ debounce }
    tooltip=${ translate('Check available spells in the spellbook.') }
  />`;
  }

  private ProcessLink(element: any, id: any) {
    const printText = () => {
      console.log('Hello World!');
    }

    const modalService = (window as any).modalService as ModalService
    const stateService = (window as any).stateService as ProcessLinkStateService;
    const processLinkService = (window as any).processLinkService as ProcessLinkService;

    const openModal = () => {
      var activityListenerType = element?.element?.type;
      if (activityListenerType === 'bpmn:UserTask') {
        activityListenerType= activityListenerType + ':create';
      } else {
        activityListenerType = activityListenerType + ':start';
      }



      modalService.setModalData({
        id: element.element.businessObject.id,
        type: element.element.businessObject.$type,
        activityListenerType,
        name: element.element?.businessObject?.name,
      });

      if (activityListenerType) {
        processLinkService.getProcessLinkCandidates(activityListenerType)
          .pipe(
            tap(res => {
              //stateService.setModalParams(element);
              //stateService.setElementName(element?.element?.name);

              stateService.setAvailableProcessLinkTypes(res);

              if (res?.length > 0) {
                stateService.showModal();
              }
            })
          ).subscribe()
      }
    }

    return html`<button onclick="${ openModal }">Link action</button>`;
  }
}
