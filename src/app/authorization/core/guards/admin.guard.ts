import { type CanActivateFn } from '@angular/router';
import { roleGuard } from './role.guard';

/**
 * Admin Guard
 *
 * Специализированный guard только для администраторов.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['Admin'] };
  return roleGuard(route, state);
};
