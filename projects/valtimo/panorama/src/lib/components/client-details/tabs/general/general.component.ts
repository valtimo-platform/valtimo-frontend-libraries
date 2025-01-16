import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { PersonCardComponent } from "../../person-card/person-card.component";
import { Person } from "../../../../models";

@Component({
  selector: 'panorama-general-tab',
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PersonCardComponent]
})
export class GeneralTabComponent {
  @Input() public person: Person;
}