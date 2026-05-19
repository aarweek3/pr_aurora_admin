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
      import('@language-app/components/language-manager.component').then(
        (m) => m.LanguageManagerComponent,
      ),
  },
  {
    path: 'test-language-app',
    loadComponent: () =>
      import('../debug-tools/test-languageApp/test-language-app.component').then(
        (m) => m.TestLanguageAppComponent,
      ),
  },
  {
    path: 'test-mexico-flag',
    loadComponent: () =>
      import('../debug-tools/test-languageApp/test-language-app-get-massiv-icon-from-db.component').then(
        (m) => m.TestLanguageAppGetMassivIconFromDbComponent,
      ),
  },
  {
    path: 'test-file-browser',
    loadComponent: () =>
      import('../debug-tools/test-file-browser/test-file-browser.component').then(
        (m) => m.TestFileBrowserComponent,
      ),
  },
  {
    path: 'test-tinymce',
    loadComponent: () =>
      import('../debug-tools/test-tinymce/test-tinymce.component').then(
        (m) => m.TestTinymceComponent,
      ),
  },
  {
    path: 'test-av-image',
    loadComponent: () =>
      import('./test-av-image/test-av-image.component').then((m) => m.TestAvImageComponent),
  },
  {
    path: 'test-layout',
    loadComponent: () =>
      import('./test-layout-debug/test-layout-debug.component').then(
        (m) => m.TestLayoutDebugComponent,
      ),
  },
  {
    path: 'test-image-studio',
    loadComponent: () =>
      import('./test-image-studio/test-image-studio.component').then(
        (m) => m.TestImageStudioComponent,
      ),
  },
  {
    path: 'test-image-studio-v2',
    loadComponent: () =>
      import('./test-image-studio-v2/test-image-studio-v2.component').then(
        (m) => m.TestImageStudioV2Component,
      ),
  },
  {
    path: 'test-window-seamless',
    loadComponent: () =>
      import('./test-window-seamless/test-window-seamless.component').then(
        (m) => m.TestWindowSeamlessComponent,
      ),
  },
  {
    path: 'test-image-editor-vs',
    loadComponent: () =>
      import('./test-image-editor-vs/test-image-editor-vs.component').then(
        (m) => m.TestImageEditorVsComponent,
      ),
  },
  {
    path: 'icon-sync',
    loadComponent: () => import('./icon-sync/icon-sync.component').then((m) => m.IconSyncComponent),
  },
];
