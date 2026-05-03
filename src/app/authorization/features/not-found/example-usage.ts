// 📁 example-usage.ts
// Пример использования NotFoundComponent в маршрутизации

import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'help',
    loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent)
  },
  // 404 страница
  {
    path: '404',
    component: NotFoundComponent,
    data: {
      title: 'Страница не найдена',
      showInBreadcrumb: false
    }
  },
  // Перенаправление всех неизвестных маршрутов на 404
  {
    path: '**',
    redirectTo: '/404'
  }
];

// Альтернативный способ использования как ленивого компонента:
export const lazyRoutes: Routes = [
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
