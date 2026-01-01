import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layout/admin-layout/admin-layout.component';

// TODO: Import AuthLayout when created (Phase 6)
// import { AuthLayoutComponent } from './shared/components/layout/auth-layout/auth-layout.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // Or 'auth/login'
    pathMatch: 'full',
  },
  {
    path: 'login/external-callback',
    redirectTo: 'auth/external-callback',
  },
  // Admin Layout - Phase 4 Complete
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
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
      {
        path: 'settings',
        loadChildren: () =>
          import('./auth/pages/settings-user/settings-user.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./auth/pages/user-profile/user-profile.routes').then(
            (m) => m.USER_PROFILE_ROUTES,
          ),
      },
      {
        path: 'icon-categories',
        loadChildren: () =>
          import('./pages/icon-category-manager/routes/icon-category-manager.routes').then(
            (m) => m.ICON_CATEGORY_MANAGER_ROUTES,
          ),
      },
      // { path: 'reports', loadChildren: () => import('./pages/reports/reports.routes') },
    ],
  },
  // Auth Layout
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
];
