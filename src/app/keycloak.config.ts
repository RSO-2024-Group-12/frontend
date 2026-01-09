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
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    },
  });
