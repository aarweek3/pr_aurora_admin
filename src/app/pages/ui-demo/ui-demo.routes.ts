// src/app/pages/ui-demo/ui-demo.routes.ts
import { Routes } from '@angular/router';

export const UI_DEMO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui-demo.component').then((m) => m.UiDemoComponent),
  },
];
