import { Injector } from '@angular/core';
import {Components, FormioCustomComponentInfo, registerCustomFormioComponent} from '@formio/angular';
import { FormIoAddressComponent } from './form-io-address.component';
import {formIoAddressEditForm} from './form-io-address-edit-form';

function extendDefaultEditForm(defaultEditForm) {
  const defaultForm = defaultEditForm();
  const tabsComponent = defaultForm.components.find(component => component.type === 'tabs');

  if (tabsComponent) {
    tabsComponent.components = [...formIoAddressEditForm.components[0].components]; //To add default tabs, use: '...tabsComponent.components'
    console.log('tabs: ', tabsComponent.components);
  } else {
    defaultForm.components = [
      {
        type: 'tabs',
        key: 'customTabs',
        components: [
          ...defaultForm.components.map((component, index) => ({ label: `Tab ${index + 1}`, key: `tab${index + 1}`, components: [component] })),
          ...formIoAddressEditForm.components
        ]
      }
    ];
  }

  return defaultForm;
}

const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'valtimo-address',
  selector: 'valtimo-form-io-address',
  title: 'Valtimo Address',
  group: 'basic',
  icon: 'user',
  schema: {
    label: 'Valtimo Address',
    key: 'address',
    hideLabel: true,
    tableView: true,
    validate: {
      required: true
    },
    customMessage: ''
  },
  editForm: () => extendDefaultEditForm(Components.components.textfield.editForm)
};

export function registerFormioAddressComponent(injector: Injector) {
  registerCustomFormioComponent(COMPONENT_OPTIONS, FormIoAddressComponent, injector);
}
