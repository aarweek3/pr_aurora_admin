import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('../features/admin-users/admin-users.component').then((m) => m.AdminUsersComponent),
    title: 'Управление пользователями',
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('../features/admin-roles/admin-roles.component').then((m) => m.AdminRolesComponent),
    title: 'Управление ролями',
  },
  {
    path: 'dictionary-seeding',
    loadComponent: () =>
      import('../../AGREGATOR/PAGES/MAINTENANCE/DictionarySeedingPage/dictionary-seeding.component').then(
        (m) => m.DictionarySeedingComponent,
      ),
    title: 'Наполнение справочников',
  },
];
