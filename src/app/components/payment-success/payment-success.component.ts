import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NakupRESTService, PaymentOrderDTO } from '../../api/nakup';

@Component({
  standalone: true,
  template: `<p class="p-4">Potrjevanje plačila...</p>`,
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private nakupService = inject(NakupRESTService);
  private router = inject(Router);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    const order: PaymentOrderDTO = {
      id_buyer: 1,
      id_seller: 1,
      currency: 'EUR',

      id_order: token!,
      redirect_url: window.location.href,
      amount: 0, // backend recalculates from PayPal

      return_url: '',
      cancel_url: '',

      street: 'x',
      house_number: 'x',
      city: 'x',
      postal_code: 'x',
      country: 'x',

      items: [],
    };

    this.nakupService.v1NakupConfirmPost(order).subscribe({
      next: () => {
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error(err);
        alert('Napaka pri potrditvi plačila');
      },
    });
  }
}
