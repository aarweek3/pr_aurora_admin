// src/app/core/guards/guards.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../services/auth.service';

/**
 * Базовый guard для авторизации
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Guard для гостей (неавторизованных пользователей)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Перенаправляем авторизованного пользователя на подходящую страницу
  const targetRoute = authService.getRedirectRoute();
  return router.createUrlTree([targetRoute]);
};

/**
 * Универсальный guard для проверки ролей
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  // Проверяем авторизацию
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const requiredRoles = (route.data?.['roles'] as string[]) || [];
  const requireAll = (route.data?.['requireAll'] as boolean) || false;

  // Если роли не требуются, пропускаем
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

  // Доступ запрещен - показываем сообщение и перенаправляем
  message.error('Insufficient permissions to access this page');
  const targetRoute = authService.getRedirectRoute();
  return router.createUrlTree([targetRoute]);
};

/**
 * Guard только для администраторов
 */
export const adminGuard: CanActivateFn = (route, state) => {
  // Используем roleGuard с ролью Admin
  route.data = { ...route.data, roles: ['Admin'] };
  return roleGuard(route, state);
};

/**
 * Guard для модераторов и администраторов
 */
export const moderatorGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['Admin', 'Moderator'] };
  return roleGuard(route, state);
};

/**
 * Guard только для обычных пользователей (исключает админов и модераторов)
 */
export const userOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const userRoles = authService.getUserRoles();

  // Если пользователь админ или модератор - перенаправляем на их панель
  if (userRoles.includes('Admin')) {
    return router.createUrlTree(['/admin-entrance-dashboard']);
  }

  if (userRoles.includes('Moderator')) {
    return router.createUrlTree(['/moderator/dashboard']);
  }

  // Обычные пользователи проходят
  return true;
};
