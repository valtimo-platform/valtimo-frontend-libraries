import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ExportRoleOutput, RoleExport} from '../../models';
import {BehaviorSubject} from 'rxjs';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-export-role-modal',
  templateUrl: './export-role-modal.component.html',
  styleUrls: ['./export-role-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportRoleModalComponent {
  @Input() open = false;
  @Input() exportRowKeys: Array<string>;

  @Output() exportEvent = new EventEmitter<ExportRoleOutput>();
  @Output() closeEvent = new EventEmitter<any>();

  public readonly selectedType$ = new BehaviorSubject<RoleExport | null>(null);

  public onCancel(): void {
    this.resetType();
    this.closeEvent.emit();
  }

  public onConfirm(type: RoleExport): void {
    this.exportEvent.emit({type, roleKeys: this.exportRowKeys});
    this.resetType();
  }

  public selectType(type: RoleExport): void {
    this.selectedType$.next(type);
  }

  private resetType(): void {
    setTimeout(() => {
      this.selectedType$.next(null);
    }, CARBON_CONSTANTS.modalAnimationMs);
  }
}
