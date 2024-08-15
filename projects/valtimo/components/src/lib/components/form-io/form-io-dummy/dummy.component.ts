import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormioCustomComponent} from '../../../modules';

/**
 * Custom formio component for iban bank accounts.
 */
@Component({
  selector: 'valtimo-dummy',
  template: '',
})
export class FormioDummyComponent implements FormioCustomComponent<any> {
  @Input() public value: string;
  @Input() public disabled = false;
  @Input() public required = false;
  @Output() public valueChange = new EventEmitter<any>();
}
