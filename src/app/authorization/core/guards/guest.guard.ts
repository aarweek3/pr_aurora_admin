import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard
 *
 * Пропускает только неавторизованных пользователей.
 * Авторизованных перенаправляет на главную или returnUrl.
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  const targetRoute = authService.getRedirectRoute();
  return router.createUrlTree([targetRoute]);
};
