import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NakupRESTService, PaymentOrderDTO } from '../../api/nakup';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private nakupService = inject(NakupRESTService);
  private cart = inject(CartComponent);
  private router = inject(Router);

  address = {
    street: '',
    house_number: '',
    city: '',
    postal_code: '',
    country: 'Slovenija',
  };

  submit() {
    const cartItems = this.cart.cartItemsWithProducts();

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
        id_izdelek: ci.item.id_izdelek,
        naziv: ci.item.naziv,
        cena: ci.item.cena,
        kolicina: ci.item.kolicina,
      })),
    };

    this.nakupService.v1NakupStartPost(order).subscribe({
      next: (res) => {
        // BACKEND RETURNS redirect_url (PayPal)
        window.location.href = res.redirect_url!;
      },
      error: (err) => {
        console.error(err);
        alert('Napaka pri začetku plačila');
      },
    });
  }
}
