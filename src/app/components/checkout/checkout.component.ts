import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NakupRESTService, PaymentOrderDTO } from '../../api/nakup';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { KosaricaDTO, KosaricaRESTService } from '../../api/kosarica';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';

// const mockCart = {
//   id_uporabnik: 1,
//   kosarica: [
//     {
//       id_kosarica: 101,
//       id_izdelek: 1001,
//       naziv: 'Mleko',
//       cena: 1.29,
//       kolicina: 2,
//     },
//     {
//       id_kosarica: 102,
//       id_izdelek: 1002,
//       naziv: 'Kruh',
//       cena: 2.49,
//       kolicina: 1,
//     },
//     {
//       id_kosarica: 103,
//       id_izdelek: 1003,
//       naziv: 'Jabolka',
//       cena: 0.99,
//       kolicina: 5,
//     },
//   ],
// };

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  providers: [MessageService],
  imports: [Card, Button, Toast, FormsModule, InputText, ProgressSpinner, TableModule, DecimalPipe],
})
export class CheckoutComponent implements OnInit {
  private nakupService = inject(NakupRESTService);
  private messageService = inject(MessageService);
  private kosaricaService = inject(KosaricaRESTService);
  private router = inject(Router);

  userId = 1; // Demo user ID
  cart = signal<KosaricaDTO | null>(null);
  loading = signal(true);
  shippingCost = 4.99;

  totalCost = computed(() => {
    return (this.cart()?.kosarica ?? []).reduce(
      (sum, item) => sum + (item.cena ?? 0) * (item.kolicina ?? 0),
      this.shippingCost,
    );
  });

  ngOnInit() {
    this.fetchCart();
  }

  address = {
    street: '',
    house_number: '',
    city: '',
    postal_code: '',
    country: 'Slovenija',
  };

  fetchCart() {
    this.loading.set(true);

    this.kosaricaService.v1KosaricaIdGet(this.userId).subscribe({
      next: (data) => {
        this.cart.set(data);
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

  submit() {
    const cart = this.cart();
    if (!cart) return;

    const cartItems = cart.kosarica ?? [];

    const order: PaymentOrderDTO = {
      id_buyer: 1, // later from auth
      id_seller: 1, // or marketplace owner
      currency: 'EUR',

      return_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/cart`,

      street: this.address.street,
      house_number: this.address.house_number,
      city: this.address.city,
      postal_code: this.address.postal_code,
      country: this.address.country,

      items: cartItems.map((ci) => ({
        id_izdelek: ci.id_izdelek,
        naziv: ci.naziv,
        cena: ci.cena,
        kolicina: ci.kolicina,
      })),
    };

    this.nakupService.v1NakupStartPost(order).subscribe({
      next: (res) => {
        // BACKEND RETURNS redirect_url (PayPal)
        window.location.href = res.redirect_url!;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Napaka',
          detail: 'Napaka pri izvajanju plačila. Prepričajte se, da mikroservis nakup teče.',
        });
      },
    });
  }
}
