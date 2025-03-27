import {
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, combineLatest, map, Observable, of, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, switchMap, take, tap} from 'rxjs/operators';
import {TranslateModule} from '@ngx-translate/core';
import {
  ButtonModule,
  DialogModule,
  InputModule,
  ModalModule,
  ModalService,
  TabsModule,
  TagModule,
} from 'carbon-components-angular';
import {
  AlertService,
  CarbonListModule,
  ConfirmationModalModule,
  EditorModel,
  EditorModule,
  FormIoModule,
  PageHeaderService,
  PageTitleService,
  PendingChangesComponent,
  RenderInPageHeaderDirectiveModule,
  ShellService,
  SpinnerModule,
  ValtimoCdsModalDirectiveModule,
  WidgetModule,
} from '@valtimo/components';
import {FormManagementService} from '../../services';
import {
  EDIT_TABS,
  FormDefinition,
  FormManagementParams,
  ModifyFormDefinitionRequest,
} from '../../models';
import {FormioForm} from '@formio/angular';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormManagementDuplicateComponent} from '../form-management-duplicate';
import {ManagementContext} from '@valtimo/config';
import {FormManagementUploadComponent} from '../form-management-upload';

@Component({
  selector: 'valtimo-form-management-edit',
  templateUrl: './form-management-edit.component.html',
  styleUrls: ['./form-management-edit.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ButtonModule,
    InputModule,
    ReactiveFormsModule,
    FormsModule,
    WidgetModule,
    CarbonListModule,
    ValtimoCdsModalDirectiveModule,
    TabsModule,
    EditorModule,
    FormIoModule,
    RenderInPageHeaderDirectiveModule,
    DialogModule,
    TagModule,
    ConfirmationModalModule,
    SpinnerModule,
    FormManagementUploadComponent,
  ],
})
export class FormManagementEditComponent
  extends PendingChangesComponent
  implements OnInit, OnDestroy
{
  @HostBinding('class') public readonly class = 'valtimo-form-management-edit';

  @Output() public readonly deleteEvent = new EventEmitter<void>();

  public modifiedFormDefinition: FormioForm | null = null;
  public validJsonChange: boolean | null = null;

  public readonly CARBON_THEME = 'g10';
  public readonly TABS = EDIT_TABS;

  public activeTab = EDIT_TABS.BUILDER;

  public readonly editQueryParam$: Observable<string | null> = this.route.queryParamMap.pipe(
    map(params => (params.has('edit') ? params.get('edit') : null))
  );

  public readonly context$: Observable<ManagementContext | ''> = this.route.data.pipe(
    map(data => data && (data['context'] as ManagementContext))
  );

  public readonly caseManagementRouteParams$: Observable<FormManagementParams | null> = this.route
    .parent
    ? this.route.parent.params.pipe(
        map(({caseDefinitionName, caseVersionTag}) =>
          caseDefinitionName && caseVersionTag
            ? {
                definitionName: caseDefinitionName,
                versionTag: caseVersionTag,
              }
            : null
        )
      )
    : of(null);

  private readonly _formDefinition$ = new BehaviorSubject<FormDefinition | null>(null);

  private get _formDefinition(): FormDefinition {
    return this._formDefinition$.getValue();
  }

  public readonly formDefinition$ = this._formDefinition$.pipe(
    filter((definition: FormDefinition | null) => !!definition),
    distinctUntilChanged(
      (prevFormDefinition, currFormDefinition) =>
        JSON.stringify(prevFormDefinition?.formDefinition?.components) ===
        JSON.stringify(currFormDefinition?.formDefinition?.components)
    ),
    tap(() => {
      if (!this._editorInitialized) {
        this._editorInitialized = true;
        return;
      }
      this.pendingChanges = true;
    })
  );

  public readonly jsonFormDefinition$ = new BehaviorSubject<EditorModel | null>(null);
  public readonly jsonOutput$ = new BehaviorSubject<EditorModel | null>(null);
  public readonly reloading$ = new BehaviorSubject<boolean>(false);
  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);
  public readonly showModal$ = new BehaviorSubject<boolean>(false);
  public readonly compactMode$ = this.pageHeaderService.compactMode$;

  private _activeOuput: string;
  private _alertSub: Subscription = Subscription.EMPTY;
  private _changeActive = false;
  private _editorInitialized = false;

  constructor(
    private readonly alertService: AlertService,
    private readonly formManagementService: FormManagementService,
    private readonly modalService: ModalService,
    private readonly pageTitleService: PageTitleService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly shellService: ShellService,
    private readonly pageHeaderService: PageHeaderService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.pageTitleService.disableReset();
    this.loadFormDefinition();
    this.checkToOpenUploadModal();
  }

  public ngOnDestroy(): void {
    this._alertSub.unsubscribe();
    this.pageTitleService.enableReset();
  }

  public formBuilderChanged(event, definition: EditorModel): void {
    if (event.type === 'updateComponent') {
      return;
    }
    this._changeActive = true;
    this.modifiedFormDefinition = event.form;
    this._formDefinition$.next({...this._formDefinition, formDefinition: event.form});
    this.jsonFormDefinition$.next({...definition, value: JSON.stringify(event.form)});
    this._changeActive = false;
  }

  public delete(): void {
    this.showDeleteModal$.next(true);
  }

  public deleteFormDefinition(definition: FormDefinition): void {
    this.pendingChanges = false;

    combineLatest([this.context$, this.caseManagementRouteParams$])
      .pipe(
        switchMap(([context, caseManagementRouteParams]) => {
          switch (context) {
            case 'case':
              return this.formManagementService.deleteFormDefinitionCase(
                caseManagementRouteParams.definitionName,
                caseManagementRouteParams.versionTag,
                definition.id
              );

            case 'independent':
            default:
              return this.formManagementService.deleteFormDefinition(definition.id);
          }
        }),
        switchMap(() => this.context$)
      )
      .subscribe({
        next: context => {
          switch (context) {
            case 'case':
              this.deleteEvent.emit();
              break;
            case 'independent':
            default:
              this.router.navigate(['/form-management']);
          }
          this.alertService.success('Form deleted');
        },
        error: () => {
          this.alertService.error('Error deleting Form');
        },
      });
  }

  public modifyFormDefinition(definition: FormDefinition): void {
    this.pendingChanges = false;

    const form = JSON.stringify(
      this.modifiedFormDefinition !== null ? this.modifiedFormDefinition : definition.formDefinition
    );

    const request: ModifyFormDefinitionRequest = {
      id: definition.id,
      name: definition.name,
      formDefinition: form,
    };

    combineLatest([this.context$, this.caseManagementRouteParams$])
      .pipe(
        switchMap(([context, caseManagementRouteParams]) => {
          switch (context) {
            case 'case':
              return this.formManagementService.modifyFormDefinitionCase(
                caseManagementRouteParams.definitionName,
                caseManagementRouteParams.versionTag,
                request
              );

            case 'independent':
            default:
              return this.formManagementService.modifyFormDefinition(request);
          }
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/form-management']);
          this.alertService.success('Form deployed');
        },
        error: () => {
          this.alertService.error('Error deploying Form');
        },
      });
  }

  private loadFormDefinition(): void {
    combineLatest([this.context$, this.caseManagementRouteParams$, this.editQueryParam$])
      .pipe(
        switchMap(([context, caseManagementRouteParams, formDefinitionId]) => {
          if (!formDefinitionId) return of(null);

          switch (context) {
            case 'case':
              return this.formManagementService.getFormDefinitionCase(
                caseManagementRouteParams.definitionName,
                caseManagementRouteParams.versionTag,
                formDefinitionId
              );

            case 'independent':
            default:
              return this.formManagementService.getFormDefinition(formDefinitionId);
          }
        })
      )
      .subscribe((definition: FormDefinition | null) => {
        if (!definition) return;

        this._formDefinition$.next(definition);
        this.pageTitleService.setCustomPageTitle(definition.name);
        this.jsonFormDefinition$.next({
          value: JSON.stringify(definition.formDefinition),
          language: 'json',
        });
      });
  }

  public downloadFormDefinition(definition: FormDefinition): void {
    const file = new Blob([JSON.stringify(definition.formDefinition)], {
      type: 'text/json',
    });
    const link = document.createElement('a');
    link.download = `form_${definition.name}.json`;
    link.href = window.URL.createObjectURL(file);
    link.click();
    window.URL.revokeObjectURL(link.href);
    link.remove();
  }

  public onSelectedTab(tab: EDIT_TABS): void {
    this.activeTab = tab;

    if (tab === EDIT_TABS.BUILDER) {
      return;
    }

    setTimeout(() => {
      this.shellService.onMainContentResize();
    });
  }

  public onOutputChange(event: {data: object | undefined}): void {
    this.reloading$.next(false);

    if (!event.data) {
      return;
    } else if (JSON.stringify(event.data) === this._activeOuput) {
      return;
    }

    this._activeOuput = JSON.stringify(event.data);
    this.jsonOutput$.next({value: this._activeOuput, language: 'json'});
  }

  public onValueChangeEvent(value: string, definition: FormDefinition, disabled: boolean): void {
    if (this._changeActive || this.validJsonChange === false || disabled) {
      return;
    }

    const parsedDefinition = JSON.parse(value);

    this.modifiedFormDefinition = parsedDefinition;

    this._formDefinition$.next({
      ...definition,
      formDefinition: parsedDefinition,
    });
  }

  public onValidEvent(value: boolean, disabled: boolean): void {
    if (this._changeActive || disabled) {
      return;
    }

    this.validJsonChange = value;
  }

  public showUploadModal(): void {
    this.showModal$.next(true);
  }

  public showDuplicateModal(definition: FormDefinition): void {
    this.modalService.create({
      component: FormManagementDuplicateComponent,
      inputs: {
        formToDuplicate: definition,
      },
    });
  }

  public setFormDefinition(formDefinition: any): void {
    this.reloading$.next(true);

    const definition = JSON.parse(formDefinition);
    if (!definition?.components) {
      this.reloading$.next(false);
      this.alertService.error('Invalid form.io. Missing JSON field "components".');
      return;
    }

    const components = definition.components;
    const currentDefinition = this.modifiedFormDefinition || definition.formDefinition;
    const newDefinition = {...currentDefinition, ...(components && {components})};

    this.modifiedFormDefinition = newDefinition;
    definition.formDefinition = newDefinition;

    this.jsonFormDefinition$.next({
      value: JSON.stringify(newDefinition),
      language: 'json',
    });
  }

  protected onConfirmRedirect(): void {
    const cancelButton: HTMLElement | null = document.querySelector('button[ref="cancelButton"]');
    if (!cancelButton) {
      return;
    }

    cancelButton.click();
  }

  private checkToOpenUploadModal(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params?.upload === 'true') {
        this.showUploadModal();
      }
    });
  }
}
