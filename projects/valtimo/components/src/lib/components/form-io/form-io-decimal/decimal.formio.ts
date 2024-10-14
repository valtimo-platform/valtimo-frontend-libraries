import {Injector} from '@angular/core';
import {FormIoDecimalComponent} from './decimal.component';
import {FormioCustomComponentInfo, registerCustomFormioComponent} from '../../../modules';

const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: 'decimal',
  selector: 'valtimo-decimal',
  title: 'Decimal',
  group: 'basic',
  icon: 'hashtag',
  schema: {
    label: 'Decimal component',
    key: 'decimal',
    hideLabel: false,
    tableView: true,
    validate: {
      required: true,
    },
  },
};

export function registerFormioDecimalComponent(injector: Injector) {
  registerCustomFormioComponent(COMPONENT_OPTIONS, FormIoDecimalComponent, injector);
}
