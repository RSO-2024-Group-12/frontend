import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IzdelekRESTService } from '../../api/izdelki/api/izdelekREST.service';
import { KosaricaRESTService } from '../../api/kosarica/api/kosaricaREST.service';
import { SkladisceRESTService } from '../../api/skladisce/api/skladisceREST.service';
import { IzdelekDTO } from '../../api/izdelki/model/izdelekDTO';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ImageModule } from 'primeng/image';

const mockIzdelki: IzdelekDTO[] = [
  {
    id_izdelek: 1,
    naziv: 'Pametna ura X100',
    opis: 'Pametna ura z merjenjem srčnega utripa in GPS.',
    cena: 199.99,
    aktiven: true,
    datum_dodajanja: '2024-01-15T10:30:00Z',
    datum_spremembe: '2024-06-01T14:45:00Z',
    zaloga: 25,
    slike: [
      { id_slika: 1, url: '' },
      { id_slika: 2, url: '' },
    ],
    slikeDodaj: [],
    slikeBrisi: [],
    lastnosti: [
      { id_lastnost: 1, lastnost: 'Barva', vrednost: 'Črna' },
      { id_lastnost: 2, lastnost: 'Velikost', vrednost: '42mm' },
    ],
    lastnostiDodaj: [],
    lastnostiBrisi: [],
  },
];

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DataViewModule,
    ProgressSpinnerModule,
    MessageModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ToastModule,
    ImageModule,
  ],
  providers: [MessageService],
  templateUrl: 'product-list.component.html',
  styles: [
    `
      :host ::ng-deep .p-dataview-content {
        background: transparent;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  private messageService = inject(MessageService);
  private izdelekService = inject(IzdelekRESTService);
  private kosaricaService = inject(KosaricaRESTService);
  private skladisceService = inject(SkladisceRESTService);
  private router = inject(Router);

  products = signal<IzdelekDTO[]>(mockIzdelki);
  filteredProducts = signal<IzdelekDTO[]>(mockIzdelki);
  loading = signal(true);

  searchTerm = '';
  userId = 1;

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading.set(true);

    this.izdelekService.v1IzdelkiAktivniGet().subscribe({
      next: (data) => {
        this.products.set(data);
        this.filteredProducts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri nalaganju izdelkov. Prepričajte se, da mikroservis izdelki teče.',
        });
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = value;

    const allProducts = this.products();

    if (!value) {
      this.filteredProducts.set(allProducts);
      return;
    }

    const filtered = allProducts.filter(
      (p) => p.naziv?.toLowerCase().includes(value) || p.opis?.toLowerCase().includes(value),
    );
    this.filteredProducts.set(filtered);
  }

  addToCart(product: IzdelekDTO) {
    // const cartItem: KosaricaDTO = {
    //   id_uporabnik: this.userId,
    //   kosarica: [
    //     {
    //       id_kosarica:
    //     }
    //   ]
    //   izdelekId: product.id_izdelek,
    //   kolicina: 1
    // };
    // this.kosaricaService.v1KosaricaPost(cartItem).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Uspešno',
    //       detail: `${product.naziv} dodan v košarico`
    //     });
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Napaka',
    //       detail: 'Napaka pri dodajanju v košarico'
    //     });
    //   }
    // });
  }

  viewProduct(id: number | undefined) {
    if (id) {
      this.router.navigate(['/products', id]);
    }
  }
}
