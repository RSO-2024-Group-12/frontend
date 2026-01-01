import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IzdelekRESTService } from '../../api/izdelki/api/izdelekREST.service';
import { KosaricaRESTService } from '../../api/kosarica/api/kosaricaREST.service';
import { SkladisceRESTService } from '../../api/skladisce/api/skladisceREST.service';
import { IzdelekDTO } from '../../api/izdelki/model/izdelekDTO';
import { ZalogaDTO } from '../../api/skladisce/model/zalogaDTO';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { KosaricaDTO } from '../../api/kosarica';

const mockIzdelek: IzdelekDTO = {
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
};
const mockZaloga: ZalogaDTO = {
  id_product: 1,
  stock: 25,
  reserved: 5,
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    GalleriaModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,
    ToastModule,
    InputNumberModule,
    FormsModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: 'product-detail.component.html',
  styles: [],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private izdelekService = inject(IzdelekRESTService);
  private kosaricaService = inject(KosaricaRESTService);
  private skladisceService = inject(SkladisceRESTService);
  private messageService = inject(MessageService);

  product = signal<IzdelekDTO | null>(mockIzdelek);
  stockInfo = signal<ZalogaDTO | null>(mockZaloga);
  loading = signal(true);
  quantity = signal(1);
  userId = 1; // Demo user ID

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProduct(+id);
    }
  }

  fetchProduct(id: number) {
    this.loading.set(true);

    this.izdelekService.v1IzdelkiIdGet(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.loading.set(false);
        this.fetchStockInfo(id);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri nalaganju izdelka',
        });
      },
    });
  }

  fetchStockInfo(id: number) {
    this.skladisceService.v1SkladisceZalogaIdGet(id).subscribe({
      next: (data) => {
        this.stockInfo.set(data);
      },
      error: (err) => {
        console.error('Stock info not available:', err);
        // Don't show error to user, just log it
      },
    });
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    const cartItem: KosaricaDTO = {
      id_uporabnik: this.userId,
      kosarica: [
        {
          id_izdelek: product.id_izdelek,
          cena: product.cena,
          kolicina: this.quantity(),
        },
      ],
    };

    this.kosaricaService.v1KosaricaPost(cartItem).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspešno',
          detail: `${product.naziv} (${this.quantity()}x) dodan v košarico`,
        });
        this.quantity.set(1);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri dodajanju v košarico',
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
