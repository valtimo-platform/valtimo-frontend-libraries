import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CarbonListModule, ColumnConfig, ViewType} from '@valtimo/components';
import {Observable, tap} from 'rxjs';
import {Collaborator} from '../../models';
import {CaseCollaboratorsService} from '../../services/case-collaborators.service';

@Component({
  selector: 'valtimo-dossier-management-collaborators-list',
  templateUrl: './dossier-management-collaborators-list.component.html',
  styleUrl: './dossier-management-collaborators-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CarbonListModule],
})
export class DossierManagementCollaboratorsListComponent {
  public readonly collaborators$: Observable<Collaborator[] | null> =
    this.caseCollaboratorsService.collaborators$;
  

  public readonly COLLABORATORS_FIELDS: ColumnConfig[] = [
    {
      key: 'email',
      label: 'User email',
      viewType: ViewType.TEXT,
    },
  ];
  constructor(private readonly caseCollaboratorsService: CaseCollaboratorsService) {}

  public onRowClicked() {}
}
