import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AccessControlService} from '../../services/access-control.service';
import {BehaviorSubject, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './access-control-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlEditorComponent implements OnInit {
  public readonly permissions$ = new BehaviorSubject<any>(null);

  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.getPermissions();
  }

  private getPermissions(): void {
    this.route.params
      .pipe(switchMap(params => this.accessControlService.getRolePermissions(params.id)))
      .subscribe(permissions => {
        console.log(permissions);
        this.permissions$.next(permissions);
      });
  }
}
