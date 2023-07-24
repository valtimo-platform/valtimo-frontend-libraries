import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ExportRoleOutput, RoleExport} from '../../models';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-export-role-modal',
  templateUrl: './export-role-modal.component.html',
  styleUrls: ['./export-role-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportRoleModalComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Input() exportRowKeys: Array<string>;
  @Input() reset$!: Observable<null>;
  @Input() disabled: boolean;

  @Output() exportEvent = new EventEmitter<ExportRoleOutput>();
  @Output() closeEvent = new EventEmitter<any>();

  public readonly selectedType$ = new BehaviorSubject<RoleExport | null>(null);

  private _resetSubscription!: Subscription;

  public ngOnInit(): void {
    this.openResetSubscription();
  }

  public ngOnDestroy(): void {
    this._resetSubscription?.unsubscribe();
  }

  public onCancel(): void {
    if (!this.disabled) {
      this.resetType();
      this.closeEvent.emit();
    }
  }

  public onConfirm(type: RoleExport): void {
    this.exportEvent.emit({type, roleKeys: this.exportRowKeys});
  }

  public selectType(type: RoleExport): void {
    this.selectedType$.next(type);
  }

  private resetType(): void {
    setTimeout(() => {
      this.selectedType$.next(null);
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  private openResetSubscription(): void {
    this._resetSubscription = this.reset$?.subscribe(() => {
      this.closeEvent.emit();
      this.resetType();
    });
  }
}
