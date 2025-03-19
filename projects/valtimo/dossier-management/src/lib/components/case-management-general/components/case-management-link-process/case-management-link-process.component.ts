import {Component} from '@angular/core';
import {ListItem} from 'carbon-components-angular';
import {BehaviorSubject, combineLatest, map, Observable, switchMap, tap} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ConfigService, UploadProvider, ValtimoConfig} from '@valtimo/config';
import {ActivatedRoute} from '@angular/router';
import {DocumentenApiLinkProcessService, DocumentenApiVersionService} from '../../services';

@Component({
  selector: 'valtimo-case-management-link-process',
  templateUrl: './case-management-link-process.component.html',
  styleUrl: './case-management-link-process.component.scss',
})
export class CaseManagementLinkProcessComponent {
  public readonly documentenApiUploadProviders$ = new BehaviorSubject<boolean>(false);

  private readonly _documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params?.name),
    filter(name => !!name)
  );

  public readonly selectedProcessKey$ = new BehaviorSubject<string>('');
  public readonly processItems$: Observable<Array<ListItem>> = combineLatest([
    this.documentenApiLinkProcessService.getProcessDefinitions(),
    this.selectedProcessKey$,
  ]).pipe(
    map(([definitions, selectedProcessKey]) =>
      (definitions || [])
        .filter(definition => !!definition?.key)
        .map(process => ({
          content: process?.name || '-',
          id: process.key,
          selected: selectedProcessKey === process.key,
        }))
    ),
    tap(() => this.documentenApiVersionService.refresh())
  );

  public readonly disabled$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly configService: ConfigService,
    private readonly route: ActivatedRoute,
    private readonly documentenApiLinkProcessService: DocumentenApiLinkProcessService,
    private readonly documentenApiVersionService: DocumentenApiVersionService
  ) {}

  public ngOnInit(): void {
    this.setDocumentenApiUploaderProvider(this.configService.config);
  }

  public selectProcess(item: {id: string}): void {
    const processDefinitionKey = item?.id;
    this.disabled$.next(true);
    const currentSelectionId = this.selectedProcessKey$.getValue();

    if (processDefinitionKey && processDefinitionKey !== currentSelectionId) {
      console.log('Uno');
      this.disabled$.next(false);
      this._documentDefinitionName$
        .pipe(
          switchMap(documentDefinitionName =>
            this.documentenApiLinkProcessService.updateLinkedUploadProcess(
              documentDefinitionName,
              processDefinitionKey
            )
          )
        )
        .subscribe(processLink => {
          this.selectedProcessKey$.next(processLink.processDefinitionKey);
          console.log('Dos');
          this.disabled$.next(false);
        });
    } else if (!processDefinitionKey) {
      this._documentDefinitionName$
        .pipe(
          switchMap(documentDefinitionName =>
            this.documentenApiLinkProcessService.deleteLinkedUploadProcess(documentDefinitionName)
          )
        )
        .subscribe(() => {
          this.selectedProcessKey$.next('');
          console.log('Tres');
          this.disabled$.next(false);
        });
    }
  }

  private setDocumentenApiUploaderProvider(config: ValtimoConfig): void {
    const hasDocumentenApiUploadProvider = config.uploadProvider === UploadProvider.DOCUMENTEN_API;

    this.documentenApiUploadProviders$.next(hasDocumentenApiUploadProvider);
    if (hasDocumentenApiUploadProvider) this.getDefaultSelection();
  }

  private getDefaultSelection(): void {
    this._documentDefinitionName$
      .pipe(
        switchMap(documentDefinitionName =>
          this.documentenApiLinkProcessService.getLinkedUploadProcess(documentDefinitionName)
        )
      )
      .subscribe(linkedUploadProcess => {
        if (linkedUploadProcess) {
          this.selectedProcessKey$.next(linkedUploadProcess.processDefinitionKey);
        }
      });
  }
}
