import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { IzdelekRESTService } from './api/izdelki/api/izdelekREST.service';
import { KosaricaRESTService } from './api/kosarica/api/kosaricaREST.service';
import { UserOrdersEndpointService } from './api/narocila/api/userOrdersEndpoint.service';
import { UserShipmentsEndpointService } from './api/posiljanje/api/userShipmentsEndpoint.service';
import { SkladisceRESTService } from './api/skladisce/api/skladisceREST.service';
import { BASE_PATH as IZDELKI_BASE_PATH } from './api/izdelki/variables';
import { BASE_PATH as KOSARICA_BASE_PATH } from './api/kosarica/variables';
import { BASE_PATH as NAROCILA_BASE_PATH } from './api/narocila/variables';
import { BASE_PATH as POSILJANJE_BASE_PATH } from './api/posiljanje/variables';
import { BASE_PATH as SKLADISCE_BASE_PATH } from './api/skladisce/variables';
import { provideKeycloakAngular } from './keycloak.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakAngular(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    // Services
    IzdelekRESTService,
    KosaricaRESTService,
    UserOrdersEndpointService,
    UserShipmentsEndpointService,
    SkladisceRESTService,
    // Base paths for microservices
    { provide: IZDELKI_BASE_PATH, useValue: 'http://localhost:8080' },
    { provide: KOSARICA_BASE_PATH, useValue: 'http://localhost:8081' },
    { provide: SKLADISCE_BASE_PATH, useValue: 'http://localhost:8082' },
    { provide: NAROCILA_BASE_PATH, useValue: 'http://localhost:8083' },
    { provide: POSILJANJE_BASE_PATH, useValue: 'http://localhost:8084' },
  ],
};
