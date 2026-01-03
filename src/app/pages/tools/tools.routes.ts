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
];
