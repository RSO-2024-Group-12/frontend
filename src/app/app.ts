import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenubarModule, ButtonModule, BadgeModule, RouterLink],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Nakupify');
  protected readonly cartItemCount = signal(0);

  items: MenuItem[] = [
    {
      label: 'Izdelki',
      icon: 'pi pi-box',
      routerLink: '/products',
    },
    {
      label: 'Košarica',
      icon: 'pi pi-shopping-cart',
      routerLink: '/cart',
    },
    {
      label: 'Naročila',
      icon: 'pi pi-receipt',
      routerLink: '/orders',
    },
    {
      label: 'Skladišče',
      icon: 'pi pi-warehouse',
      routerLink: '/warehouse',
    },
  ];
}
