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
      {
        path: 'tools',
        loadChildren: () => import('./pages/tools/tools.routes').then((m) => m.TOOLS_ROUTES),
      },
      {
        path: 'health',
        loadChildren: () => import('./features/health/health.routes').then((m) => m.HEALTH_ROUTES),
      },
      {
        path: 'test',
        loadChildren: () => import('./pages/test/test.routes').then((m) => m.TEST_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () => import('./auth/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'auth-control',
        loadChildren: () =>
          import('./auth/auth-control/auth-control.routes').then((m) => m.AUTH_CONTROL_ROUTES),
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
