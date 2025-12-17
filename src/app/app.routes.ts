import { Routes } from '@angular/router';

// TODO: Import AdminLayout and AuthLayout when creadted (Phase 4)
// import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
// import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

// TODO: Import Guards (Phase 6)
// import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // Or 'auth/login'
    pathMatch: 'full',
  },
  // Admin Layout
  {
    path: '',
    // component: AdminLayoutComponent,
    canActivate: [], // [authGuard]
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
        // Using Welcome as placeholder from default angular project if exists, otherwise this will need to be created.
      },
      // ... other features
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
