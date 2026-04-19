import { Routes } from '@angular/router';

export const DEVELOPER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../component/developer.component').then((m) => m.DeveloperComponent),
  },
];
