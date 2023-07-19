import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AccessControlService} from '../../services/access-control.service';

@Component({
  templateUrl: './access-control-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlEditorComponent implements OnInit {
  constructor(private readonly accessControlService: AccessControlService) {}

  public ngOnInit(): void {
    console.log('hi');
  }
}
