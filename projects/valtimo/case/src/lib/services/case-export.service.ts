import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {combineLatest, first, switchMap} from 'rxjs';
import {CaseListService} from './case-list.service';
import {CaseParameterService} from './case-parameter.service';
import {CaseListSearchService} from './case-list-search.service';

@Injectable()
export class CaseExportService {
  constructor(
    private http: HttpClient,
    private readonly listService: CaseListService,
    private readonly parameterService: CaseParameterService,
    private readonly caseListSearchService: CaseListSearchService
  ) {}

  downloadExport(): void {
    combineLatest([
      this.listService.caseDefinitionKey$,
      this.parameterService.querySearchParams$,
      this.parameterService.queryAssigneeParam$,
      this.parameterService.queryStatusParams$,
      this.parameterService.queryCaseTagsParams$,
    ])
      .pipe(
        first(),
        switchMap(data => {
          const body = {
            documentDefinitionName: data[0],
            searchOperator: 'AND',
            assigneeFilter: data[2],
            statusFilter: data[3],
            caseTagsFilter: data[4],
            otherFilters: this.caseListSearchService.mapSearchValuesToFilters(data[1]),
          };
          return combineLatest([
            this.listService.caseDefinitionKey$,
            this.http.post(
              `/api/v1/case/${data[0]}/export?definitionName=${data[0]}&page=0&size=10&sort=createdOn%2CDESC`,
              body,
              {responseType: 'blob'}
            ),
          ]);
        })
      )
      .subscribe(data => {
        const url = URL.createObjectURL(data[1]);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = `${data[0]}-export.csv`;
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
  }
}
