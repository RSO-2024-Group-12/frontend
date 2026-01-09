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
import { Tooltip } from 'primeng/tooltip';
import { RequestDTO } from '../../api/skladisce';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';

interface ProductWithStock {
  product: IzdelekDTO;
  stock: ZalogaDTO | null;
}

// const mockProductsWithStock: ProductWithStock[] = [
//   {
//     product: {
//       id_izdelek: 1,
//       naziv: 'Brezžične slušalke Pro',
//       opis: 'Aktivno odpravljanje šumov in dolga avtonomija baterije.',
//       cena: 129.99,
//       aktiven: true,
//       datum_dodajanja: '2024-02-10T09:00:00Z',
//       datum_spremembe: '2024-05-18T16:20:00Z',
//       zaloga: 40,
//       slike: [
//         {
//           id_slika: 1,
//           url: 'https://example.com/slusalke-front.jpg',
//         },
//       ],
//       lastnosti: [
//         {
//           id_lastnost: 1,
//           lastnost: 'Barva',
//           vrednost: 'Bela',
//         },
//         {
//           id_lastnost: 2,
//           lastnost: 'Baterija',
//           vrednost: '30h',
//         },
//       ],
//     },
//     stock: {
//       id_product: 1,
//       stock: 40,
//       reserved: 5,
//     },
//   },
//   {
//     product: {
//       id_izdelek: 2,
//       naziv: 'Mehanska tipkovnica RGB',
//       opis: 'Tipkovnica z mehanskimi stikali in RGB osvetlitvijo.',
//       cena: 99.5,
//       aktiven: true,
//       datum_dodajanja: '2024-03-01T11:30:00Z',
//       datum_spremembe: '2024-06-02T10:10:00Z',
//       zaloga: 15,
//       slike: [
//         {
//           id_slika: 2,
//           url: 'https://example.com/tipkovnica.jpg',
//         },
//       ],
//       lastnosti: [
//         {
//           id_lastnost: 3,
//           lastnost: 'Stikala',
//           vrednost: 'Red',
//         },
//         {
//           id_lastnost: 4,
//           lastnost: 'Layout',
//           vrednost: 'US',
//         },
//       ],
//     },
//     stock: {
//       id_product: 2,
//       stock: 15,
//       reserved: 2,
//     },
//   },
// ];

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
    Tooltip,
    FormsModule,
    Dialog,
    Textarea,
    Checkbox,
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
  showAddDialog = signal(false);
  newProduct = signal<IzdelekDTO>({
    naziv: '',
    opis: '',
    cena: 0,
    aktiven: true,
    lastnostiDodaj: [],
    slikeDodaj: [],
  });
  userId = 1; // Demo user ID

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
    if (!products || products.length === 0) {
      this.productsWithStock.set([]);
      this.filteredProductsWithStock.set([]);
      this.loading.set(false);
      return;
    }

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

    const requestDto: RequestDTO = {
      id_request: crypto.randomUUID(),
      type: 'STOCK_ADDED',
      id_product: productId,
      id_user: this.userId,
      quantityAdd: 1,
      quantityRemove: 0,
    };

    this.skladisceService.v1SkladiscePost(requestDto).subscribe({
      next: () => {
        const productsWithStock = structuredClone(this.productsWithStock());
        const productWithStock = productsWithStock.find(
          (el) => el.product.id_izdelek === productId,
        );
        if (productWithStock?.stock?.stock) {
          productWithStock.stock.stock = (productWithStock?.stock?.stock ?? 0) + 1;
        }
        this.productsWithStock.set(productsWithStock);
        this.filteredProductsWithStock.set(productsWithStock);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri dodajanju zaloge',
        });
      },
    });
  }

  removeStock(productId: number | undefined) {
    if (!productId) return;

    const requestDto: RequestDTO = {
      id_request: crypto.randomUUID(),
      type: 'STOCK_REMOVED',
      id_product: productId,
      id_user: this.userId,
      quantityAdd: 0,
      quantityRemove: 1,
    };

    this.skladisceService.v1SkladiscePost(requestDto).subscribe({
      next: () => {
        const productsWithStock = structuredClone(this.productsWithStock());
        const productWithStock = productsWithStock.find(
          (el) => el.product.id_izdelek === productId,
        );
        if (productWithStock?.stock?.stock) {
          productWithStock.stock.stock = (productWithStock?.stock?.stock ?? 0) - 1;
        }
        this.productsWithStock.set(productsWithStock);
        this.filteredProductsWithStock.set(productsWithStock);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri odstranjevanju zaloge',
        });
      },
    });
  }

  getStockSeverity(quantity: number): 'success' | 'warn' | 'danger' {
    if (quantity > 10) return 'success';
    if (quantity > 0) return 'warn';
    return 'danger';
  }

  openAddItemDialog() {
    this.newProduct.set({
      naziv: '',
      opis: '',
      cena: 0,
      aktiven: true,
      lastnostiDodaj: [],
      slikeDodaj: [],
    });
    this.showAddDialog.set(true);
  }

  addProperty() {
    this.newProduct().lastnostiDodaj!.push({ lastnost: '', vrednost: '' });
  }

  removeProperty(i: number) {
    this.newProduct().lastnostiDodaj!.splice(i, 1);
  }

  addImage() {
    this.newProduct().slikeDodaj!.push({ url: '' });
  }

  removeImage(i: number) {
    this.newProduct().slikeDodaj!.splice(i, 1);
  }

  saveNewProduct() {
    const product = structuredClone(this.newProduct());

    this.izdelekService.v1IzdelkiPost(product).subscribe({
      next: (created) => {
        this.productsWithStock.update((list) => [
          ...list,
          { product: created, stock: { stock: 0, reserved: 0 } },
        ]);
        this.filteredProductsWithStock.set(this.productsWithStock());
        this.showAddDialog.set(false);

        this.messageService.add({
          severity: 'success',
          summary: 'Uspeh',
          detail: 'Izdelek dodan',
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri dodajanju izdelka',
        });
      },
    });
  }

  protected removeItem(productId: number | undefined) {
    if (!productId) return;

    this.izdelekService.v1IzdelkiIdDelete(productId).subscribe({
      next: () => {
        const productsWithStock = structuredClone(this.productsWithStock());
        const productWithStock = productsWithStock.find(
          (el) => el.product.id_izdelek === productId,
        );
        if (productWithStock?.product) {
          productWithStock.product.aktiven = false;
        }
        this.productsWithStock.set(productsWithStock);
        this.filteredProductsWithStock.set(productsWithStock);
        this.messageService.add({
          severity: 'success',
          summary: 'Uspeh',
          detail: 'Izdelek je bil odstranjen',
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri odstranjevanju izdelka',
        });
      },
    });
  }
}
