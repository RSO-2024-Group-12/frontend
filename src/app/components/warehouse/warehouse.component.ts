import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IzdelekRESTService } from '../../api/izdelki/api/izdelekREST.service';
import { SkladisceRESTService } from '../../api/skladisce/api/skladisceREST.service';
import { IzdelekDTO } from '../../api/izdelki/model/izdelekDTO';
import { ZalogaDTO } from '../../api/skladisce/model/zalogaDTO';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { forkJoin } from 'rxjs';

interface ProductWithStock {
  product: IzdelekDTO;
  stock: ZalogaDTO | null;
}

@Component({
  selector: 'app-warehouse',
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
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService],
  templateUrl: 'warehouse.component.html',
  styles: [],
})
export class WarehouseComponent implements OnInit {
  private izdelekService = inject(IzdelekRESTService);
  private skladisceService = inject(SkladisceRESTService);
  private messageService = inject(MessageService);

  productsWithStock = signal<ProductWithStock[]>([]);
  filteredProductsWithStock = signal<ProductWithStock[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  ngOnInit() {
    this.fetchProductsWithStock();
  }

  fetchProductsWithStock() {
    this.loading.set(true);

    this.izdelekService.v1IzdelkiGet().subscribe({
      next: (products) => {
        this.loadStockInfo(products);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri nalaganju izdelkov',
        });
      },
    });
  }

  loadStockInfo(products: IzdelekDTO[]) {
    const stockRequests = products.map((product) =>
      this.skladisceService.v1SkladisceZalogaIdGet(product.id_izdelek!),
    );

    forkJoin(stockRequests).subscribe({
      next: (stocks) => {
        const items: ProductWithStock[] = products.map((product, index) => ({
          product,
          stock: stocks[index] || null,
        }));
        this.productsWithStock.set(items);
        this.filteredProductsWithStock.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Stock info not available:', err);
        // Still show products even if stock fails
        const items: ProductWithStock[] = products.map((product) => ({
          product,
          stock: null,
        }));
        this.productsWithStock.set(items);
        this.filteredProductsWithStock.set(items);
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm.set(value);

    if (!value) {
      this.filteredProductsWithStock.set(this.productsWithStock());
      return;
    }

    const filtered = this.productsWithStock().filter(
      (item) =>
        item.product.naziv?.toLowerCase().includes(value) ||
        item.product.opis?.toLowerCase().includes(value),
    );
    this.filteredProductsWithStock.set(filtered);
  }

  addStock(productId: number | undefined) {
    if (!productId) return;

    this.messageService.add({
      severity: 'info',
      summary: 'Funkcija v razvoju',
      detail: 'Dodajanje zaloge bo na voljo v naslednji različici',
    });
  }

  removeStock(productId: number | undefined) {
    if (!productId) return;

    this.messageService.add({
      severity: 'info',
      summary: 'Funkcija v razvoju',
      detail: 'Odstranjevanje zaloge bo na voljo v naslednji različici',
    });
  }

  getStockSeverity(quantity: number): 'success' | 'warn' | 'danger' {
    if (quantity > 10) return 'success';
    if (quantity > 0) return 'warn';
    return 'danger';
  }
}
