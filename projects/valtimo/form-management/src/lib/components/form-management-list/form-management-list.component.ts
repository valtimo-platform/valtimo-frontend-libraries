import {Component} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {BehaviorSubject, combineLatest, map, Observable, of, switchMap, tap} from 'rxjs';
import {Upload16} from '@carbon/icons';
import {ButtonModule, IconModule, IconService} from 'carbon-components-angular';
import {FormManagementService} from '../../services';
import {CarbonListModule, ColumnConfig, Pagination} from '@valtimo/components';
import {FormDefinition, FormManagementParams} from '../../models';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'; // For translation support

@Component({
  selector: 'valtimo-form-management-list',
  templateUrl: './form-management-list.component.html',
  styleUrls: ['./form-management-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CarbonListModule,
    IconModule,
    ButtonModule,
    RouterModule,
  ],
})
export class FormManagementListComponent {
  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly searchTerm$ = new BehaviorSubject<string>('');

  public readonly caseManagementRouteParams$: Observable<FormManagementParams | null> =
    this.route.parent?.params.pipe(
      map(({caseDefinitionName, caseVersionTag}) =>
        caseDefinitionName && caseVersionTag
          ? {
              definitionName: caseDefinitionName,
              versionTag: caseVersionTag,
            }
          : null
      )
    ) || of(null);

  public readonly pagination$ = new BehaviorSubject<Pagination>({
    collectionSize: 0,
    page: 1,
    size: 10,
  });

  public readonly formDefinitions$ = combineLatest([
    this.caseManagementRouteParams$,
    this.pagination$,
    this.searchTerm$,
  ]).pipe(
    switchMap(([routeParams, pagination, searchTerm]) => {
      console.log(routeParams, pagination, searchTerm);
      const params = {
        ...pagination,
        pagination: pagination.page - 1,
        ...(searchTerm && {searchTerm}),
      };

      if (!routeParams?.definitionName || !routeParams?.versionTag) return;

      return this.formManagementService.queryFormDefinitionsCase(
        routeParams.definitionName,
        routeParams.versionTag,
        params
      );
    }),
    tap(() => this.loading$.next(false))
  );

  public readonly FIELDS: ColumnConfig[] = [
    {key: 'name', label: 'Form name'},
    {key: 'readOnly', label: 'Read-only'},
  ];

  constructor(
    private readonly formManagementService: FormManagementService,
    private readonly iconService: IconService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.iconService.registerAll([Upload16]);
  }

  public navigateToCreateRoute(): void {
    console.log(this.router, this.route);
    this.router.navigate(['create'], {relativeTo: this.route});
  }

  public paginationClicked(page: number): void {
    this.updatePagination({page});
  }

  public paginationSet(size: number): void {
    this.updatePagination({size, page: 1});
  }

  public editFormDefinition(formDefinition: FormDefinition): void {
    this.router.navigate(['/form-management/edit', formDefinition.id]);
  }

  public searchTermEntered(searchTerm: string): void {
    this.searchTerm$.next(searchTerm);
  }

  private updatePagination(update: Partial<Pagination>): void {
    this.pagination$.next({...this.pagination$.getValue(), ...update});
  }
}
