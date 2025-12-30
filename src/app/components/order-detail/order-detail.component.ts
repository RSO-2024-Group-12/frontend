import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderDto, UserOrdersEndpointService } from '../../api/narocila';
import { ShipmentDto, UserShipmentsEndpointService } from '../../api/posiljanje';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TimelineModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,
    ToastModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: 'order-detail.component.html',
  styles: [],
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordersService = inject(UserOrdersEndpointService);
  private shipmentsService = inject(UserShipmentsEndpointService);
  private messageService = inject(MessageService);

  order = signal<OrderDto | null>(null);
  shipments = signal<ShipmentDto[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchOrder(+id);
    }
  }

  fetchOrder(id: number) {
    this.loading.set(true);

    this.ordersService.apiOrdersIdGet(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loading.set(false);
        this.fetchShipments(id);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri nalaganju naročila',
        });
      },
    });
  }

  fetchShipments(orderId: number) {
    this.shipmentsService.apiShipmentsGet(orderId).subscribe({
      next: (data) => {
        this.shipments.set(data);
      },
      error: (err) => {
        console.error('Shipments not available:', err);
        // Don't show error to user, just log it
      },
    });
  }

  trackShipment(shipmentId: number | undefined) {
    if (!shipmentId) return;

    this.shipmentsService.apiShipmentsIdTrackingGet(shipmentId).subscribe({
      next: (tracking) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Lokacija pošiljke',
          detail: `Zadnja lokacija: ${tracking.externalStatus || 'N/A'}`,
          life: 5000,
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Informacije o sledenju niso na voljo',
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
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

  getShipmentStatusLabel(status: string | undefined): string {
    const labels: { [key: string]: string } = {
      PENDING: 'V pripravi',
      IN_TRANSIT: 'V tranzitu',
      OUT_FOR_DELIVERY: 'V dostavi',
      DELIVERED: 'Dostavljeno',
      FAILED: 'Neuspešno',
    };
    return labels[status || 'PENDING'] || status || 'Neznano';
  }

  getShipmentStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' {
    const severities: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      PENDING: 'warn',
      IN_TRANSIT: 'info',
      OUT_FOR_DELIVERY: 'info',
      DELIVERED: 'success',
      FAILED: 'danger',
    };
    return severities[status || 'PENDING'] || 'info';
  }
}
