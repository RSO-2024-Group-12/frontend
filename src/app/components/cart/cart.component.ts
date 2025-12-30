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

interface CartItemWithProduct {
  item: any;
  product: IzdelekDTO | null;
  subtotal: number;
}

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

  cart = signal<KosaricaDTO | null>(null);
  cartItemsWithProducts = signal<CartItemWithProduct[]>([]);
  loading = signal(true);

  userId = 1; // Demo user ID
  shippingCost = signal(4.99);

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
          subtotal: (products[index].cena || 0) * (item.kolicina || 0),
        }));
        this.cartItemsWithProducts.set(items);
      },
      error: (err) => {
        console.error('Error loading product details:', err);
        // Still show cart items even if product details fail
        const items: CartItemWithProduct[] = cart!.kosarica!.map((item) => ({
          item,
          product: null,
          subtotal: 0,
        }));
        this.cartItemsWithProducts.set(items);
      },
    });
  }

  updateQuantity(item: IzdelekDTO) {
    // const cartUpdate: KosaricaDTO = {
    //   uporabnikId: this.userId,
    //   izdelekId: item.izdelekId,
    //   kolicina: item.kolicina,
    // };
    //
    // this.kosaricaService.v1KosaricaPut(cartUpdate).subscribe({
    //   next: () => {
    //     this.loadProductDetails();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Posodobljeno',
    //       detail: 'Količina posodobljena',
    //     });
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Napaka',
    //       detail: 'Napaka pri posodabljanju količine',
    //     });
    //   },
    // });
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
    // this.kosaricaService.v1KosaricaIdDelete(item.id).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Odstranjeno',
    //       detail: 'Izdelek odstranjen iz košarice',
    //     });
    //     this.fetchCart();
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Napaka',
    //       detail: 'Napaka pri odstranjevanju izdelka',
    //     });
    //   },
    // });
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
    return this.calculateSubtotal() + this.shippingCost();
  }

  checkout() {
    // Navigate to orders page or show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Naročilo oddano',
      detail: 'Vaše naročilo je bilo uspešno oddano!',
    });
    // In a real app, you would call the narocila service here
    setTimeout(() => {
      this.router.navigate(['/orders']);
    }, 1500);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}
