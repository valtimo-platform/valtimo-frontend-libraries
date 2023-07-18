import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Role} from '../../models';

@Component({
  selector: 'valtimo-add-role-modal',
  templateUrl: './add-role-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRoleModalComponent implements OnInit {
  @Input() open: boolean = false;
  @Output() close: EventEmitter<Role | null> = new EventEmitter<Role | null>();

  public form: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      key: this.fb.control('', Validators.required),
    });
  }

  public onCancel(): void {
    this.close.emit(null);
  }

  public onConfirm(): void {
    const nameControl: AbstractControl | null = this.form.get('key');

    if (!nameControl) {
      return;
    }

    this.close.emit({roleKey: nameControl.value});
  }
}
