import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ModalModule} from 'carbon-components-angular';
import {LoggingEvent} from '../../models';
import {EditorModel, EditorModule} from '@valtimo/components';

@Component({
  selector: 'valtimo-log-details',
  templateUrl: './log-details.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalModule, EditorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogDetailsComponent {
  private _logEventModel: EditorModel | null = null;
  @Input() public set logEvent(value: LoggingEvent | null) {
    if (!value) {
      this._logEventModel = null;
      return;
    }

    this._logEventModel = {
      value: JSON.stringify(value),
      language: 'json',
    };
  }
  public get logEventModel(): EditorModel | null {
    return this._logEventModel;
  }

  @Output() closeModalEvent = new EventEmitter();

  public onCloseSelect(): void {
    this.closeModalEvent.emit();
  }
}
