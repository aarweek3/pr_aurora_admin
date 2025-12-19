import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layout/admin-layout/admin-layout.component';

// TODO: Import AuthLayout when created (Phase 6)
// import { AuthLayoutComponent } from './shared/components/layout/auth-layout/auth-layout.component';

// TODO: Import Guards (Phase 6)
// import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // Or 'auth/login'
    pathMatch: 'full',
  },
  // Admin Layout - Phase 4 Complete
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [], // TODO: Add [authGuard] in Phase 6
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
      },
      {
        path: 'ui-demo',
        loadChildren: () => import('./pages/ui-demo/ui-demo.routes').then((m) => m.UI_DEMO_ROUTES),
      },
      // TODO: Add feature modules (Phase 7)
      // { path: 'users', loadChildren: () => import('./pages/users/users.routes') },
      // { path: 'content', loadChildren: () => import('./pages/content/content.routes') },
      // { path: 'settings', loadChildren: () => import('./pages/settings/settings.routes') },
      // { path: 'reports', loadChildren: () => import('./pages/reports/reports.routes') },
    ],
  },
  // Auth Layout
  {
    path: 'auth',
    // component: AuthLayoutComponent,
    children: [
      // { path: 'login', loadComponent: ... }
    ],
  },
];
