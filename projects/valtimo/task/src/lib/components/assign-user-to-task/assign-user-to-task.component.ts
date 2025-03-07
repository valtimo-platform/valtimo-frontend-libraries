/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {SearchableDropdownSelectModule} from '@valtimo/components';
import {BehaviorSubject, combineLatest, Subject, Subscription, take, tap} from 'rxjs';
import {TaskService} from '../../services';
import {NamedUser} from '@valtimo/config';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {
  ButtonModule,
  ComboBoxModule,
  DatePickerModule,
  IconModule,
  IconService,
  LayerModule,
  ListItem,
  ToggletipModule,
} from 'carbon-components-angular';
import {UserFollow16} from '@carbon/icons';
import {map} from 'rxjs/operators';

@Component({
  selector: 'valtimo-assign-user-to-task',
  templateUrl: './assign-user-to-task.component.html',
  styleUrls: ['./assign-user-to-task.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SearchableDropdownSelectModule,
    ButtonModule,
    ToggletipModule,
    IconModule,
    LayerModule,
    DatePickerModule,
    ComboBoxModule,
  ],
})
export class AssignUserToTaskComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() public readonly taskId: string;
  @Input() public readonly assigneeId: string;
  @Output() public readonly assignmentOfTaskChanged = new EventEmitter();

  public readonly assignedIdOnServer$ = new BehaviorSubject<string | null>(null);
  private readonly _assignedUserFullName$ = new BehaviorSubject<string | null>(null);
  public readonly assignedUserFullName$ = this._assignedUserFullName$.pipe(
    map(fullName => fullName?.trim())
  );

  private readonly _candidateUsersForTask$ = new BehaviorSubject<NamedUser[] | undefined>(
    undefined
  );

  private readonly _selectedUserId$ = new BehaviorSubject<string | null>(null);
  public readonly selectedUserId$ = this._selectedUserId$.asObservable();

  public readonly candidateUsersForTask$ = combineLatest([
    this._candidateUsersForTask$,
    this._selectedUserId$,
  ]).pipe(map(([users, selectedUserId]) => this.mapUsersForDropdown(users, selectedUserId)));

  public readonly mouseIsOverAssignee$ = new BehaviorSubject<boolean>(false);
  public readonly open$ = new Subject<boolean>();
  public readonly disabled$ = new BehaviorSubject<boolean>(true);

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly taskService: TaskService,
    private readonly iconService: IconService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {
    this.iconService.registerAll([UserFollow16]);
  }

  public ngOnInit(): void {
    this._subscriptions.add(
      this.taskService.getCandidateUsers(this.taskId).subscribe(candidateUsers => {
        this._candidateUsersForTask$.next(candidateUsers);
        if (this.assigneeId) {
          this.assignedIdOnServer$.next(this.assigneeId);
          this._selectedUserId$.next(this.assigneeId);
          this._assignedUserFullName$.next(
            this.getAssignedUserName(candidateUsers, this.assigneeId)
          );
        }
        this.enable();
      })
    );
  }

  public ngAfterViewInit(): void {
    const button = this.elementRef.nativeElement.querySelector('button.cds--toggletip-button');
    if (!button) return;
    button.classList.remove('cds--toggletip-button');
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._candidateUsersForTask$.pipe(take(1)).subscribe(candidateUsers => {
      const currentUserId = changes.assigneeId?.currentValue || this.assigneeId;
      this.assignedIdOnServer$.next(currentUserId || null);
      this._selectedUserId$.next(currentUserId || null);
      this._assignedUserFullName$.next(
        this.getAssignedUserName(candidateUsers ?? [], currentUserId)
      );
    });
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public assignTask(userId: string): void {
    this.disable();

    combineLatest([
      this._candidateUsersForTask$,
      this.taskService.assignTask(this.taskId, {assignee: userId}),
    ])
      .pipe(take(1))
      .subscribe({
        next: ([candidateUsers]) => {
          this._selectedUserId$.next(userId);
          this.assignedIdOnServer$.next(userId);
          this._assignedUserFullName$.next(this.getAssignedUserName(candidateUsers ?? [], userId));
          this.closeToggletip();
          this.emitChange();
          this.enable();
        },
        error: () => {
          this.enable();
        },
      });
  }

  public unassignTask(): void {
    this.disable();
    this.taskService
      .unassignTask(this.taskId)
      .pipe(
        tap(() => {
          this.emitChange();
          this.enable();
          this.clear();
        })
      )
      .subscribe();
  }

  public getAssignedUserName(users: NamedUser[], userId: string): string {
    if (users && userId) {
      const findUser =
        users.find(user => user.id === userId) || users.find(user => user.userName === userId);
      return findUser ? findUser.label : userId;
    }
    return userId || '-';
  }

  public onMouseEnterAssignee(): void {
    this.mouseIsOverAssignee$.next(true);
  }

  public onMouseLeaveAssignee(): void {
    this.mouseIsOverAssignee$.next(false);
  }

  public onSubmitButtonClick(): void {
    this.assignTask(this._selectedUserId$.getValue());
  }
  public onUserSelect(event: ListItem): void {
    if (!event?.id) return;
    this._selectedUserId$.next(event.id);
  }

  public clear(): void {
    this.assignedIdOnServer$.next(null);
    this._selectedUserId$.next(null);
  }

  private mapUsersForDropdown(users: NamedUser[], selectedUserId: string): ListItem[] {
    return (
      users
        ?.map(user => ({...user, lastName: user.lastName?.split(' ').splice(-1)[0] || ''}))
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .map(user => ({content: user.label, id: user.id, selected: user.id === selectedUserId})) ||
      []
    );
  }

  private emitChange(): void {
    this.assignmentOfTaskChanged.emit();
  }

  private enable(): void {
    this.disabled$.next(false);
  }

  private disable(): void {
    this.disabled$.next(true);
  }

  private closeToggletip(): void {
    // needed to reliably trigger toggle tip closure
    this.open$.next(true);
    setTimeout(() => this.open$.next(false));
  }
}
