import {Component} from '@angular/core';

@Component({
  selector: 'valtimo-case-management-general',
  templateUrl: './case-management-general.component.html',
  styleUrl: './case-management-general.component.scss',
})
export class CaseManagementGeneralComponent {
  public processes = ['example'];
  constructor() {}
}
