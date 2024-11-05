import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Output,
  signal,
} from '@angular/core';
import {DossierManagementDetailsMenuItemComponent} from './dossier-management-details-menu-item/dossier-management-details-menu-item.component';
import {MENU_ITEMS} from '../../mocks';
import {TabEnum} from '../../models';
import {ButtonModule} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-dossier-management-details-menu',
  templateUrl: './dossier-management-details-menu.component.html',
  styleUrl: './dossier-management-details-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DossierManagementDetailsMenuItemComponent, ButtonModule],
})
export class DossierManagementDetailsMenuComponent {
  @HostBinding('class') public readonly class = '';
  @Output() menuItemSelected = new EventEmitter<TabEnum | string | null>();

  public readonly isItemSelected = signal<boolean>(false);
  public readonly MENU_ITEMS = MENU_ITEMS;

  public onMenuItemSelected(url: TabEnum | string | null): void {
    this.isItemSelected.set(!!url);
    this.menuItemSelected.emit(url);
  }
}
