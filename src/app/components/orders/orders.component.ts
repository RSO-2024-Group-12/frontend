import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserOrdersEndpointService } from '../../api/narocila/api/userOrdersEndpoint.service';
import { OrderDto } from '../../api/narocila/model/orderDto';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// const mockOrders: OrderDto[] = [
//   {
//     id: 101,
//     userId: 42,
//     recipientName: 'Janez Novak',
//     street: 'Glavna ulica',
//     houseNumber: '12A',
//     city: 'Ljubljana',
//     postalCode: '1000',
//     country: 'Slovenia',
//     totalPriceCents: 25997,
//     shippingCostCents: 499,
//     paid: true,
//     paymentMethod: 'CREDIT_CARD',
//     shipmentId: 5551,
//     trackingNumber: 'SI123456789',
//     status: 'SHIPPED',
//     createdAt: '2024-11-20T09:15:00Z',
//     updatedAt: '2024-11-21T14:30:00Z',
//     items: [
//       {
//         id: 1,
//         productId: 10,
//         quantity: 1,
//         unitPriceCents: 19999,
//         totalPriceCents: 19999,
//       },
//       {
//         id: 2,
//         productId: 25,
//         quantity: 2,
//         unitPriceCents: 3000,
//         totalPriceCents: 6000,
//       },
//     ],
//   },
// ];

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: 'orders.component.html',
  styles: [],
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(UserOrdersEndpointService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  orders = signal<OrderDto[]>([]);
  loading = signal(true);
  userId = 1; // Demo user ID

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading.set(true);

    this.ordersService.apiOrdersGet(this.userId, 0, 100).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri nalaganju naročil. Prepričajte se, da mikroservis naročila teče.',
        });
      },
    });
  }

  viewOrder(id: number | undefined) {
    if (id) {
      this.router.navigate(['/orders', id]);
    }
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  getStatusLabel(status: string | undefined): string {
    const labels: { [key: string]: string } = {
      PENDING: 'V obdelavi',
      CONFIRMED: 'Potrjeno',
      PROCESSING: 'V pripravi',
      SHIPPED: 'Poslano',
      DELIVERED: 'Dostavljeno',
      CANCELLED: 'Preklicano',
    };
    return labels[status || 'PENDING'] || status || 'Neznano';
  }

  getStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' {
    const severities: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      PENDING: 'warn',
      CONFIRMED: 'info',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    };
    return severities[status || 'PENDING'] || 'info';
  }
}
