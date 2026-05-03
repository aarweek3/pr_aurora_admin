import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard
 *
 * Проверяет наличие определенных ролей у пользователя.
 *
 * @example
 * { path: 'admin', canActivate: [roleGuard], data: { roles: ['Admin'] } }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const requiredRoles = (route.data?.['roles'] as string[]) || [];
  const requireAll = (route.data?.['requireAll'] as boolean) || false;

  if (requiredRoles.length === 0) {
    return true;
  }

  const userRoles = authService.getUserRoles();
  const hasAccess = requireAll
    ? requiredRoles.every((role) => userRoles.includes(role))
    : requiredRoles.some((role) => userRoles.includes(role));

  if (hasAccess) {
    return true;
  }

  message.error('У вас недостаточно прав для доступа к этой странице');
  const targetRoute = authService.getRedirectRoute();
  return router.createUrlTree([targetRoute]);
};
