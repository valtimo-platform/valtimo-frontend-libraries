import {Component, OnInit} from '@angular/core';
import {DocumentService} from '@valtimo/document';

@Component({
  selector: 'valtimo-dossier-management-assignee',
  templateUrl: './dossier-management-assignee.component.html',
  styleUrls: ['./dossier-management-assignee.component.css'],
})
export class DossierManagementAssigneeComponent implements OnInit {
  canHaveAssignee = false;
  constructor(private readonly documentService: DocumentService) {}

  ngOnInit(): void {}

  toggleAssignee(): void {
    this.canHaveAssignee = !this.canHaveAssignee;
  }
}
