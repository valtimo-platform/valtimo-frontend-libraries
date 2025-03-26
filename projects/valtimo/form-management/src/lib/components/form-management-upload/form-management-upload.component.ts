import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {DropzoneModule, ModalComponent, ModalModule, WidgetModule} from '@valtimo/components'; // Assuming this is the location
import {DocumentService} from '@valtimo/document';
import {CommonModule} from '@angular/common';
import {ButtonModule, InputModule} from 'carbon-components-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'; // Include FormBuilder, FormControl

@Component({
  selector: 'valtimo-form-management-upload',
  templateUrl: './form-management-upload.component.html',
  styleUrls: ['./form-management-upload.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    InputModule,
    ModalModule,
    FormsModule,
    ReactiveFormsModule,
    WidgetModule,
    DropzoneModule,
  ],
})
export class FormManagementUploadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('uploadFormDefinitionModal') modal: ModalComponent;

  @Input() show$: Observable<boolean>;
  @Output() definitionUploaded: EventEmitter<any> = new EventEmitter();

  readonly clear$ = new Subject();
  readonly jsonString$ = new BehaviorSubject<string>('');
  readonly error$ = new BehaviorSubject<string>('');
  readonly disabled$ = new BehaviorSubject<boolean>(false);

  private showSubscription: Subscription;
  private fileSubscription: Subscription;
  private errorSubscription: Subscription;

  private readonly file$ = new BehaviorSubject<File>(undefined);

  constructor(
    private readonly documentService: DocumentService,
    private readonly translateService: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.openShowSubscription();
    this.openFileSubscription();
  }

  ngOnDestroy(): void {
    this.showSubscription.unsubscribe();
    this.fileSubscription.unsubscribe();
    this.closeErrorSubscription();
  }

  setFile(file: File): void {
    this.clearError();
    this.file$.next(file);
  }

  uploadDefinition(): void {
    this.disable();

    this.jsonString$.pipe(take(1)).subscribe(definition => {
      this.closeErrorSubscription();
      this.clearError();
      this.enable();
      this.hideModal();
      this.definitionUploaded.emit(definition);
    });
  }

  private openErrorSubscription(errorCode: string): void {
    this.closeErrorSubscription();
    this.errorSubscription = this.translateService.stream(errorCode).subscribe(error => {
      this.error$.next(error);
    });
  }

  private closeErrorSubscription(): void {
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  private clearError(): void {
    this.error$.next('');
  }

  private openFileSubscription(): void {
    this.fileSubscription = this.file$.subscribe(file => {
      if (file) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const result = reader.result.toString();
          if (this.stringIsValidJson(result)) {
            this.jsonString$.next(result);
          } else {
            this.clearJsonString();
            this.error$.next(this.translateService.instant('dropzone.error.invalidJson'));
          }
        };

        reader.readAsText(file);
      } else {
        this.clearJsonString();
      }
    });
  }

  private openShowSubscription(): void {
    this.showSubscription = this.show$.subscribe(show => {
      if (show) {
        this.showModal();
      } else {
        this.hideModal();
      }

      this.clearJsonString();
      this.clearError();
      this.clearDropzone();
    });
  }

  private clearJsonString(): void {
    this.jsonString$.next('');
  }

  private clearDropzone(): void {
    this.clear$.next(null);
  }

  private showModal(): void {
    this.modal.show();
  }

  private hideModal(): void {
    this.modal.hide();
  }

  private stringIsValidJson(string: string) {
    try {
      JSON.parse(string)?.formDefinition?.components;
    } catch (e) {
      this.clearDropzone();
      this.openErrorSubscription('dropzone.error.invalidFormDef');
      return false;
    }
    return true;
  }

  private disable(): void {
    this.disabled$.next(true);
  }

  private enable(): void {
    this.disabled$.next(false);
  }
}
