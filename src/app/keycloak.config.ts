import { env } from './env';
import { provideKeycloak } from 'keycloak-angular';

export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      realm: env.KEYCLOAK_REALM,
      url: env.KEYCLOAK_URL,
      clientId: env.KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    },
  });
