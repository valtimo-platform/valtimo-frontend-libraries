import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {DossierManagementDetailsMenuItemComponent} from './dossier-management-details-menu-item/dossier-management-details-menu-item.component';
import {MENU_ITEMS} from '../../mocks';

@Component({
  selector: 'valtimo-dossier-management-details-menu',
  templateUrl: './dossier-management-details-menu.component.html',
  styleUrl: './dossier-management-details-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DossierManagementDetailsMenuItemComponent],
})
export class DossierManagementDetailsMenuComponent {
  @HostBinding('class') public readonly class = '';
  public readonly MENU_ITEMS = MENU_ITEMS;
}
