import { Routes } from '@angular/router';

export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'icon-manager',
    pathMatch: 'full',
  },
  {
    path: 'icon-manager',
    loadComponent: () =>
      import('./icon-manager/icon-manager.component').then((m) => m.IconManagerComponent),
  },
  {
    path: 'aurora-editor',
    loadComponent: () =>
      import('./editor-demo/editor-demo.component').then((m) => m.EditorDemoComponent),
  },
  {
    path: 'rename-all',
    loadComponent: () =>
      import('./rename-all/rename-all.component').then((m) => m.RenameAllComponent),
  },
  {
    path: 'svg-validator',
    loadComponent: () =>
      import('./svg-validator/svg-validator.component').then((m) => m.SvgValidatorComponent),
  },
  {
    path: 'language-manager',
    loadComponent: () =>
      import('../../../assets/languageApp/components/language-manager.component').then(
        (m) => m.LanguageManagerComponent,
      ),
  },
  {
    path: 'test-language-app',
    loadComponent: () =>
      import('../../../assets/tests/test-languageApp/test-language-app.component').then(
        (m) => m.TestLanguageAppComponent,
      ),
  },
  {
    path: 'test-mexico-flag',
    loadComponent: () =>
      import(
        '@assets/tests/test-languageApp/test-language-app-get-massiv-icon-from-db.component'
      ).then((m) => m.TestLanguageAppGetMassivIconFromDbComponent),
  },
  {
    path: 'test-file-browser',
    loadComponent: () =>
      import('../../../assets/tests/test-file-browser/test-file-browser.component').then(
        (m) => m.TestFileBrowserComponent,
      ),
  },
  {
    path: 'test-tinymce',
    loadComponent: () =>
      import('../../../assets/tests/test-tinymce/test-tinymce.component').then(
        (m) => m.TestTinymceComponent,
      ),
  },
];
