import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {PersonCardComponent} from '../../person-card/person-card.component';
import {TranslateModule} from '@ngx-translate/core';
import {Person} from '../../../../models';

@Component({
  selector: 'panorama-family-tab',
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, PersonCardComponent, TranslateModule],
})
export class FamilyTabComponent {
  @Input() public person: Person;
  @HostBinding('class') public readonly class = 'panorama-family-tab';
}
