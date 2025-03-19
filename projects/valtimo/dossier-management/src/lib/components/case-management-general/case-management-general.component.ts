import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  Optional,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Observable, switchMap} from 'rxjs';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {DocumentDefinition, DocumentService} from '@valtimo/document';
import {ZGW_CASE_CONFIGURATION_EXTENSIONS_TOKEN} from '@valtimo/config';

@Component({
  selector: 'valtimo-case-management-general',
  templateUrl: './case-management-general.component.html',
  styleUrl: './case-management-general.component.scss',
})
export class CaseManagementGeneralComponent implements AfterViewInit {
  @ViewChild('extensions', {read: ViewContainerRef})
  private _extensions: ViewContainerRef;

  public readonly documentDefinition$: Observable<DocumentDefinition> = this.route.paramMap.pipe(
    switchMap((params: ParamMap) =>
      this.documentService.getDocumentDefinitionForManagement(
        params.get('caseDefinitionName') ?? ''
      )
    )
  );
  constructor(
    private readonly documentService: DocumentService,
    private readonly route: ActivatedRoute,
    @Optional()
    @Inject(ZGW_CASE_CONFIGURATION_EXTENSIONS_TOKEN)
    private readonly zgwCaseConfigurationExtensionComponents: Type<any>[],
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngAfterViewInit(): void {
    this.renderExtensions();
  }

  private renderExtensions(): void {
    if (
      !Array.isArray(this.zgwCaseConfigurationExtensionComponents) ||
      this.zgwCaseConfigurationExtensionComponents.length === 0
    ) {
      return;
    }

    this.zgwCaseConfigurationExtensionComponents.forEach(extensionComponent => {
      this._extensions.createComponent(extensionComponent);
    });

    this.cdr.detectChanges();
  }
}
