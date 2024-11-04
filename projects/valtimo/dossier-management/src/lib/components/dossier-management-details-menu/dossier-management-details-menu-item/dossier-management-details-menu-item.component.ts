import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {TilesModule} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-dossier-management-details-menu-item',
  templateUrl: './dossier-management-details-menu-item.component.html',
  styleUrl: './dossier-management-details-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TilesModule],
})
export class DossierManagementDetailsMenuItemComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() iconUrl: string;
  @Input() urlPath: string;

  constructor(private readonly router: Router) {}

  public onMenuItemClick(): void {
    this.router.navigate([`/${this.urlPath}`]);
  }
}
