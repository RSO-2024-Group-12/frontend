import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KosaricaRESTService } from '../../api/kosarica/api/kosaricaREST.service';
import { IzdelekRESTService } from '../../api/izdelki/api/izdelekREST.service';
import { KosaricaDTO } from '../../api/kosarica/model/kosaricaDTO';
import { IzdelekDTO } from '../../api/izdelki/model/izdelekDTO';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { forkJoin } from 'rxjs';
import { ElementDTO } from '../../api/kosarica';

interface CartItemWithProduct {
  item: ElementDTO;
  product: IzdelekDTO | null;
  subtotal: number;
}

const mockCartItemsWithProducts = [
  {
    item: {
      id_kosarica: 101,
      id_izdelek: 1001,
      naziv: 'Mleko',
      cena: 1.29,
      kolicina: 2,
    },
    product: {
      id_izdelek: 1001,
      naziv: 'Mleko',
      opis: 'Sveže polnomastno mleko',
      cena: 1.29,
      aktiven: true,
      datum_dodajanja: '2024-01-10',
      zaloga: 120,
      slike: [{ id_slika: 1, url: 'https://example.com/mleko.jpg' }],
      lastnosti: [
        { id_lastnost: 1, lastnost: 'Maščoba', vrednost: '3.5%' },
        { id_lastnost: 2, lastnost: 'Pakiranje', vrednost: '1L' },
      ],
    },
    subtotal: 2 * 1.29,
  },
  {
    item: {
      id_kosarica: 102,
      id_izdelek: 1002,
      naziv: 'Kruh',
      cena: 2.49,
      kolicina: 1,
    },
    product: {
      id_izdelek: 1002,
      naziv: 'Kruh',
      opis: 'Sveže pečen bel kruh',
      cena: 2.49,
      aktiven: true,
      datum_dodajanja: '2024-01-12',
      zaloga: 45,
      slike: [{ id_slika: 2, url: 'https://example.com/kruh.jpg' }],
      lastnosti: [{ id_lastnost: 3, lastnost: 'Teža', vrednost: '500g' }],
    },
    subtotal: 1 * 2.49,
  },
  {
    item: {
      id_kosarica: 103,
      id_izdelek: 1003,
      naziv: 'Jabolka',
      cena: 0.99,
      kolicina: 5,
    },
    product: {
      id_izdelek: 1003,
      naziv: 'Jabolka',
      opis: 'Sveža domača jabolka',
      cena: 0.99,
      aktiven: true,
      datum_dodajanja: '2024-01-15',
      zaloga: 200,
      slike: [{ id_slika: 3, url: 'https://example.com/jabolka.jpg' }],
      lastnosti: [
        { id_lastnost: 4, lastnost: 'Sorta', vrednost: 'Gala' },
        { id_lastnost: 5, lastnost: 'Poreklo', vrednost: 'Slovenija' },
      ],
    },
    subtotal: 5 * 0.99,
  },
];

const mockCart = {
  id_uporabnik: 1,
  kosarica: [
    {
      id_kosarica: 101,
      id_izdelek: 1001,
      naziv: 'Mleko',
      cena: 1.29,
      kolicina: 2,
    },
    {
      id_kosarica: 102,
      id_izdelek: 1002,
      naziv: 'Kruh',
      cena: 2.49,
      kolicina: 1,
    },
    {
      id_kosarica: 103,
      id_izdelek: 1003,
      naziv: 'Jabolka',
      cena: 0.99,
      kolicina: 5,
    },
  ],
};

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    CardModule,
    InputNumberModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: 'cart.component.html',
  styles: [],
})
export class CartComponent implements OnInit {
  private kosaricaService = inject(KosaricaRESTService);
  private izdelekService = inject(IzdelekRESTService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  cart = signal<KosaricaDTO | null>(mockCart);
  cartItemsWithProducts = signal<CartItemWithProduct[]>(mockCartItemsWithProducts);
  loading = signal(true);

  userId = 1; // Demo user ID
  shippingCost = 4.99;

  ngOnInit() {
    this.fetchCart();
  }

  fetchCart() {
    this.loading.set(true);

    this.kosaricaService.v1KosaricaIdGet(this.userId).subscribe({
      next: (data) => {
        this.cart.set(data);
        this.loadProductDetails();
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri nalaganju košarice. Prepričajte se, da mikroservis košarica teče.',
        });
      },
    });
  }

  loadProductDetails() {
    const cart = this.cart();
    if (!cart?.kosarica || cart.kosarica.length === 0) {
      this.cartItemsWithProducts.set([]);
      return;
    }

    const productRequests = cart.kosarica.map((item) =>
      this.izdelekService.v1IzdelkiIdGet(item.id_izdelek!),
    );

    forkJoin(productRequests).subscribe({
      next: (products) => {
        const items: CartItemWithProduct[] = cart!.kosarica!.map((item, index) => ({
          item,
          product: products[index],
          subtotal: (item.cena ?? 0) * (item.kolicina ?? 0),
        }));
        this.cartItemsWithProducts.set(items);
      },
      error: (err) => {
        console.error('Error loading product details:', err);
        // Still show cart items even if product details fail
        const items: CartItemWithProduct[] = cart!.kosarica!.map((item) => ({
          item,
          product: null,
          subtotal: (item.cena ?? 0) * (item.kolicina ?? 0),
        }));
        this.cartItemsWithProducts.set(items);
      },
    });
  }

  updateQuantity(item: ElementDTO) {
    const cartUpdate: KosaricaDTO = {
      id_uporabnik: this.userId,
      kosarica: [
        {
          ...item,
        },
      ],
    };

    this.kosaricaService.v1KosaricaPut(cartUpdate).subscribe({
      next: () => {
        this.cartItemsWithProducts.update((items) =>
          items.map((item) => ({
            ...item,
            subtotal: (item.item.cena ?? 0) * (item.item.kolicina ?? 0),
          })),
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Posodobljeno',
          detail: 'Količina posodobljena',
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri posodabljanju količine',
        });
      },
    });
  }

  confirmRemoveItem(item: IzdelekDTO) {
    this.confirmationService.confirm({
      message: 'Ali ste prepričani, da želite odstraniti ta izdelek iz košarice?',
      header: 'Potrditev odstranitve',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.removeItem(item);
      },
    });
  }

  removeItem(item: IzdelekDTO) {
    const cartUpdate: KosaricaDTO = {
      id_uporabnik: this.userId,
      kosarica: [
        {
          ...item,
          kolicina: 0,
        },
      ],
    };

    this.kosaricaService.v1KosaricaPut(cartUpdate).subscribe({
      next: () => {
        this.cart.update((el) => ({
          ...el,
          kosarica: el?.kosarica?.filter((el2) => el2.id_izdelek !== item.id_izdelek),
        }));
        this.cartItemsWithProducts.update((el) =>
          el.filter((el2) => el2.item.id_izdelek !== item.id_izdelek),
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Odstranjeno',
          detail: 'Izdelek odstranjen iz košarice',
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

  confirmClearCart() {
    this.confirmationService.confirm({
      message: 'Ali ste prepričani, da želite izprazniti celotno košarico?',
      header: 'Potrditev',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        this.clearCart();
      },
    });
  }

  clearCart() {
    this.kosaricaService.v1KosaricaIdDelete(this.userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspešno',
          detail: 'Košarica izpraznjena',
        });
        this.fetchCart();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri praznjenju košarice',
        });
      },
    });
  }

  calculateSubtotal(): number {
    return this.cartItemsWithProducts().reduce((sum, item) => sum + item.subtotal, 0);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.shippingCost;
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}
