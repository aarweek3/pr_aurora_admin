import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layout/admin-layout/admin-layout.component';
import { NotFoundComponent } from './authorization/features/not-found/not-found.component';

// TODO: Import AuthLayout when created (Phase 6)
// import { AuthLayoutComponent } from './shared/components/layout/auth-layout/auth-layout.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
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
        loadChildren: () =>
          import('../app/shared/components/health/health.routes').then((m) => m.HEALTH_ROUTES),
      },
      {
        path: 'test',
        loadChildren: () => import('./pages/test/test.routes').then((m) => m.TEST_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./authorization/routes/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'auth-control',
        loadChildren: () =>
          import('./authorization/features/auth-control/auth-control.routes').then(
            (m) => m.AUTH_CONTROL_ROUTES,
          ),
      },
      // TODO: Add feature modules (Phase 7)
      // { path: 'users', loadChildren: () => import('./pages/users/users.routes') },
      // { path: 'content', loadChildren: () => import('./pages/content/content.routes') },
      {
        path: 'settings',
        loadChildren: () =>
          import('./authorization/features/pages/settings-user/settings-user.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./authorization/features/pages/user-profile/user-profile.routes').then(
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
      {
        path: 'sample-seo',
        loadChildren: () =>
          import('./pages/sample-manager-simple-language-seo/sample-main-seo.routes').then(
            (m) => m.SAMPLE_MAIN_SEO_ROUTES,
          ),
      },
      {
        path: 'sample-manager-simple-language-seo',
        redirectTo: 'sample-seo',
        pathMatch: 'full',
      },
      {
        path: 'help',
        loadChildren: () => import('./pages/help/help.routes').then((m) => m.HELP_ROUTES),
      },
      {
        path: 'agregator/references/language',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/LanguageOfAggregator/language-of-aggregator.routes').then(
            (m) => m.LANGUAGE_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/references/os',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/PlatformOfAggregatorPage/platform-of-aggregator.routes').then(
            (m) => m.PLATFORM_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/references/os-versions',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/SystemRequirementPage/system-requirement.routes').then(
            (m) => m.SYSTEM_REQUIREMENT_ROUTES,
          ),
      },
      {
        path: 'agregator/references/license-types',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/LicenseTypeOfAggregatorPage/license-type-of-aggregator.routes').then(
            (m) => m.LICENSE_TYPE_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/references/developer',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/DeveloperOfAggregatorPage/developer-of-aggregator.routes').then(
            (m) => m.DEVELOPER_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/references/categories',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/CategoryOfAggregatorPage/category-of-aggregator.routes').then(
            (m) => m.CATEGORY_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/references/categories-v2',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/CategorySimplifiedPage/category-simplified.routes').then(
            (m) => m.CATEGORY_SIMPLIFIED_ROUTES,
          ),
      },
      {
        path: 'agregator/references/tag-categories',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/CategoryTagOfAggregatorPage/category-tag-of-aggregator.routes').then(
            (m) => m.CATEGORY_TAG_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/references/tags',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/TagOfAggregatorPage/tag-of-aggregator.routes').then(
            (m) => m.TAG_OF_AGGREGATOR_ROUTES,
          ),
      },
      {
        path: 'agregator/pages/program',
        loadChildren: () =>
          import('./AGREGATOR/PAGES/SPRAVKA/ProgramOfAggregatorPage/program-of-aggregator.routes').then(
            (m) => m.PROGRAM_OF_AGGREGATOR_ROUTES,
          ),
      },

      // { path: 'reports', loadChildren: () => import('./pages/reports/reports.routes') },
    ],
  },
  // Auth Layout
  {
    path: 'auth',
    loadChildren: () => import('./authorization/routes/auth.routes').then((m) => m.authRoutes),
  },
  // Not Found & Wildcard
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
