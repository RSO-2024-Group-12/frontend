import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export function keycloakFunctionalGuard(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Promise<boolean> {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  return new Promise(async (resolve, reject) => {
    if (!(await keycloak.isLoggedIn())) {
      await keycloak.login();
      return resolve(false);
    }
    resolve(true);
  });
}
