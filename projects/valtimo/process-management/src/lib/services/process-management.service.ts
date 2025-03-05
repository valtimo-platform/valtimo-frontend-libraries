import {HttpClient} from '@angular/common/http';
<<<<<<< HEAD
import {Injectable, Signal, signal} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {BehaviorSubject, combineLatest, filter, Observable, switchMap} from 'rxjs';

import {
  CaseProcessInstance,
  PROCESS_MANAGEMENT_ENDPOINTS,
  ProcessManagementContext,
} from '../models';
=======
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {Observable, tap} from 'rxjs';
import { CaseProcessInstance } from '../models';
>>>>>>> 189cf259 (Cleanup)

@Injectable({
  providedIn: 'root',
})
export class ProcessManagementService extends BaseApiService {
<<<<<<< HEAD
  private readonly _definitionName$ = new BehaviorSubject<string | null>(null);
  private readonly _versionTag$ = new BehaviorSubject<string | null>(null);

  public processes$: Observable<CaseProcessInstance[]> = combineLatest([
    this._definitionName$,
    this._versionTag$,
  ]).pipe(
    filter(([definitionName, versionTag]) => !!definitionName && !!versionTag),
    switchMap(([definitionName, versionTag]) =>
      this.getProcesses(definitionName ?? '', versionTag ?? '')
    )
  );

  private _context = signal<ProcessManagementContext>('independent');
  public set context(value: ProcessManagementContext) {
    this._context.set(value);
  }
  public get context(): Signal<ProcessManagementContext> {
    return this._context.asReadonly();
  }
=======
  private _documentDefinitionKey: string;
  private _versionTag: string;
>>>>>>> 189cf259 (Cleanup)

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

<<<<<<< HEAD
  public setParams(definitionName: string, versionTag: string): void {
    this._definitionName$.next(definitionName);
    this._versionTag$.next(versionTag);
=======
  public setParams(documentDefinitionKey: string, versionTag: string): void {
    this._documentDefinitionKey = documentDefinitionKey;
    this._versionTag = versionTag;
  }

  public getProcesses(): Observable<CaseProcessInstance[]> {
    return this.httpClient.get<CaseProcessInstance[]>(
      this.getApiUrl(
        `/management/v1/case-definition/${this._documentDefinitionKey}/version/${this._versionTag}/process-definition`
      )
    );
>>>>>>> 189cf259 (Cleanup)
  }

  public deleteProcess(processDefinitionId: string): Observable<void> {
    return this.httpClient.delete<void>(
      this.getApiUrl(
<<<<<<< HEAD
        `${PROCESS_MANAGEMENT_ENDPOINTS[this._context()]}/${this._definitionName$.getValue()}/version/${this._versionTag$.getValue()}/process-definition/${processDefinitionId}`
=======
        `/management/v1/case-definition/${this._documentDefinitionKey}/version/${this._versionTag}/process-definition/${processDefinitionId}`
>>>>>>> 189cf259 (Cleanup)
      )
    );
  }

  public deployBpmn(bpmn: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', bpmn);
    formData.append(
      'processLinks',
      new Blob([JSON.stringify([].map(processLink => this.emptyStringToNull(processLink)))], {
        type: 'application/json',
      })
    );

    return this.httpClient.post<any>(
      this.getApiUrl(
<<<<<<< HEAD
        `${PROCESS_MANAGEMENT_ENDPOINTS[this._context()]}/${this._definitionName$.getValue()}/version/${this._versionTag$.getValue()}/process-definition`
=======
        `/management/v1/case-definition/${this._documentDefinitionKey}/version/${this._versionTag}/process-definition`
>>>>>>> 189cf259 (Cleanup)
      ),
      formData
    );
  }

<<<<<<< HEAD
  private getProcesses(
    definitionName: string,
    versionTag: string
  ): Observable<CaseProcessInstance[]> {
    return this.httpClient.get<CaseProcessInstance[]>(
      this.getApiUrl(
        `${PROCESS_MANAGEMENT_ENDPOINTS[this._context()]}/${definitionName}/version/${versionTag}/process-definition`
      )
    );
  }

=======
>>>>>>> 189cf259 (Cleanup)
  private emptyStringToNull<T extends Record<string, any>>(object: T): T {
    if (object && typeof object === 'object') {
      Object.keys(object).forEach(key => {
        const typedKey = key as keyof T;
        const value = object[typedKey];
        if (typeof value === 'object' && value !== null) {
          this.emptyStringToNull(value);
        } else if (value === '') {
          object[typedKey] = null as any;
        }
      });
    }
    return object;
  }
}
