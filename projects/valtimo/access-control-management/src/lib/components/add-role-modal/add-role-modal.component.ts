import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Role} from '../../models';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRoleModalComponent implements OnInit {
  @Input() open: boolean = false;
  @Output() close: EventEmitter<Role | null> = new EventEmitter<Role | null>();

  public form: FormGroup;

  get key() {
    return this.form.get('key');
  }

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      key: this.fb.control('', Validators.required),
    });
  }

  public onCancel(): void {
    this.close.emit(null);
    this.resetForm();
  }

  public onConfirm(): void {
    const nameControl: AbstractControl | null = this.form.get('key');

    if (!nameControl) {
      return;
    }

    this.close.emit({roleKey: nameControl.value});
    this.resetForm();
  }

  private resetForm(): void {
    setTimeout(() => {
      this.form.reset();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }
}
