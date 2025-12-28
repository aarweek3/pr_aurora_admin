import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('./components/admin-users/admin-users.component').then((m) => m.AdminUsersComponent),
    title: 'Управление пользователями',
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./components/admin-roles/admin-roles.component').then((m) => m.AdminRolesComponent),
    title: 'Управление ролями',
  },
];
