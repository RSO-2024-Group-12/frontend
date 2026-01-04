export interface EnvConfig {
  KEYCLOAK_URL: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_CLIENT_ID: string;
}

const defaults: EnvConfig = {
  KEYCLOAK_URL: 'http://localhost:8079',
  KEYCLOAK_REALM: 'nakupify',
  KEYCLOAK_CLIENT_ID: 'frontend',
};

const runtimeEnv = (window as any).__env || {};

export const env: EnvConfig = {
  KEYCLOAK_URL: runtimeEnv.KEYCLOAK_URL ?? defaults.KEYCLOAK_URL,
  KEYCLOAK_REALM: runtimeEnv.KEYCLOAK_REALM ?? defaults.KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID: runtimeEnv.KEYCLOAK_CLIENT_ID ?? defaults.KEYCLOAK_CLIENT_ID,
};
