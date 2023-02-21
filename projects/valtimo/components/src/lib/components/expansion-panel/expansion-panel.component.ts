import {Component, HostListener, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'expansion-panel-component',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss']
})
export class ExpansionPanelComponent {
  @Input() hideAboveFoldWhenExpanded = false;
  readonly open$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  @HostListener('click')
  clickInside() {
    this.open$.next(!this.open$.value);
  }
}
