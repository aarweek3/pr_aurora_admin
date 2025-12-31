import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Auth Guard (Functional)
 *
 * Защищает маршруты от неавторизованного доступа.
 * Использует AuthService для проверки состояния сессии.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Проверяем авторизацию
  if (authService.isLoggedIn()) {
    return true;
  }

  // 2. Если не авторизован — редирект на логин с сохранением returnUrl
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
