// src/app/pages/ui-demo/ui-demo.routes.ts
import { Routes } from '@angular/router';

export const UI_DEMO_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'button-ui',
    pathMatch: 'full',
  },
  {
    path: 'button-ui',
    loadComponent: () => import('./button-ui/button-ui.component').then((m) => m.ButtonUiComponent),
  },
  {
    path: 'toggle-ui',
    loadComponent: () => import('./toggle-ui/toggle-ui.component').then((m) => m.ToggleUiComponent),
  },
  {
    path: 'input-ui',
    loadComponent: () => import('./input-ui/input-ui.component').then((m) => m.InputUiComponent),
  },
  {
    path: 'phone-number-ui',
    loadComponent: () =>
      import('./phone-number-ui/phone-number-ui.component').then((m) => m.PhoneNumberUiComponent),
  },
  {
    path: 'icon-ui',
    loadComponent: () => import('./icon-ui/icon-ui.component').then((m) => m.IconUiComponent),
  },
  {
    path: 'modal-ui',
    loadComponent: () => import('./modal-ui/modal-ui.component').then((m) => m.ModalUiComponent),
  },
  {
    path: 'search-ui',
    loadComponent: () => import('./search-ui/search-ui.component').then((m) => m.SearchUiComponent),
  },
  {
    path: 'tag-ui',
    loadComponent: () => import('./tag-ui/tag-ui.component').then((m) => m.TagUiComponent),
  },
  {
    path: 'help-copy-container-ui',
    loadComponent: () =>
      import('./av-help-copy-container-ui/av-help-copy-container-ui.component').then(
        (m) => m.HelpCopyContainerUiComponent,
      ),
  },
];
