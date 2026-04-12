import { Routes } from '@angular/router';

export const HEALTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'server',
    pathMatch: 'full',
  },
  {
    path: 'server',
    loadComponent: () =>
      import('./components/health-dashboard/health-dashboard.component').then(
        (m) => m.HealthDashboardComponent,
      ),
    data: { tab: 'Infra' },
  },
  {
    path: 'database',
    loadComponent: () =>
      import('./components/health-dashboard/health-dashboard.component').then(
        (m) => m.HealthDashboardComponent,
      ),
    data: { tab: 'Infra' }, // В будущем здесь может быть специфичный таб для БД
  },
];
