import {PropertiesPanel} from 'bpmn-js-properties-panel';
import {isTextFieldEntryEdited} from '@bpmn-io/properties-panel';
import {html} from 'htm/preact';
import {ModalService} from '@valtimo/components';
import {tap} from 'rxjs';
import {ProcessLinkService, ProcessLinkStateService} from '@valtimo/process-link/index';
import {ProcessLinks, ProcessManagementService} from '../../process-management.service';

export class PropertyPanelCustomizer {
  private LOW_PRIORITY = 500;

  public static $inject = ['propertiesPanel', 'translate'];

  constructor(
    private readonly propertiesPanel: PropertiesPanel,
    private readonly translate: Function,
    private readonly modalService: ModalService
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
    return function (groups) {
      console.log('groups', groups);
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].id === 'CamundaPlatform__Implementation' || groups[i].id === 'CamundaPlatform__Form') {

          console.log('entries', groups[i].entries);
          for (let j = 0; j < groups[i].entries.length; j++) {
            if (groups[i].entries[j].id === 'implementationType') {
              groups[i].entries[j].component.getOptions = function() {
                return [
                  { value: '', label: 'test 1' },
                  { value: '2', label: 'test 2' },
                ];
              };
            }
          }

          groups[i].entries.push(
            {
              id: 'linkProcessButton',
              element,
              component: parent.ProcessLink,
              isEdited: isTextFieldEntryEdited,
            }
          );
        }
      }

      return groups;
    };
  }

  private ProcessLink(element: any, id: any) {

    console.log('element', element);
    console.log('id', id);

    const modalService = (window as any).modalService as ModalService;
    const stateService = (window as any).stateService as ProcessLinkStateService;
    const processLinkService = (window as any).processLinkService as ProcessLinkService;
    const processLinks = (window as any).processLinks as ProcessLinks

    const processLinkForElement = processLinks.processLinks$.value.find((processLink) => processLink.activityId === element.element.id);

    console.log('processLinkForElement', processLinkForElement);

    const openModal = () => {
      var activityListenerType = element?.element?.type;
      if (activityListenerType === 'bpmn:UserTask') {
        activityListenerType = activityListenerType + ':create';
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
        processLinkService
          .getProcessLinkCandidates(activityListenerType)
          .pipe(
            tap(res => {
              stateService.setModalParams(element);
              stateService.setElementName(element?.element?.name);

              if (processLinkForElement) {
                stateService.selectProcessLink(processLinkForElement);
              } else {
                stateService.setAvailableProcessLinkTypes(res);
              }

              if (res?.length > 0) {
                stateService.showModal();
              }
            })
          )
          .subscribe();
      }
    };

    if (processLinkForElement) {
      return html`<div class="bio-properties-panel-entry"><button onclick="${openModal}">Open existing action</button></div>`;
    }
    return html`<div class="bio-properties-panel-entry"><button onclick="${openModal}">Link action</button></div>`;
  }
}
