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
    path: 'button-ui-new',
    loadComponent: () =>
      import('./button-ui-new/button-ui-new.component').then((m) => m.ButtonUiNewComponent),
  },
  {
    path: 'button-control-aurora',
    loadComponent: () =>
      import('./button-control-aurora/button-control-aurora.component').then(
        (m) => m.ButtonControlAuroraComponent,
      ),
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
    path: 'icon-control',
    loadComponent: () =>
      import('./icon-control/icon-control.component').then((m) => m.IconControlComponent),
  },
  {
    path: 'icon-control-aurora',
    loadComponent: () =>
      import('./icon-control-aurora/icon-control-aurora.component').then(
        (m) => m.IconControlAuroraComponent,
      ),
  },
  {
    path: 'color-component-aurora',
    loadComponent: () =>
      import('./color-component-aurora/color-component-aurora.component').then(
        (m) => m.ColorComponentAuroraComponent,
      ),
  },
  {
    path: 'modal-ui',
    loadComponent: () => import('./modal-ui/modal-ui.component').then((m) => m.ModalUiComponent),
  },
  {
    path: 'modal-ui-new',
    loadComponent: () =>
      import('./modal-ui-new/modal-ui-new.component').then((m) => m.ModalUiNewComponent),
  },
  {
    path: 'dialog-icon-ui',
    loadComponent: () =>
      import('./dialog-icon-ui/dialog-icon-ui.component').then((m) => m.DialogIconUiComponent),
  },
  {
    path: 'field-group-ui',
    loadComponent: () =>
      import('./field-group-ui/field-group-ui.component').then((m) => m.FieldGroupUiComponent),
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
    path: 'pagination-ui',
    loadComponent: () =>
      import('./pagination-ui/pagination-ui.component').then((m) => m.PaginationUiComponent),
  },
  {
    path: 'help-copy-container-ui',
    loadComponent: () =>
      import('./av-help-copy-container-ui/av-help-copy-container-ui.component').then(
        (m) => m.HelpCopyContainerUiComponent,
      ),
  },
  {
    path: 'spinner-ui',
    loadComponent: () =>
      import('./spinner-ui/spinner-ui.component').then((m) => m.SpinnerUiComponent),
  },
  {
    path: 'progress-ui',
    loadComponent: () =>
      import('./progress-ui/progress-ui.component').then((m) => m.ProgressUiComponent),
  },
  {
    path: 'color-picker-demo',
    loadComponent: () =>
      import('./color-picker-demo/color-picker-demo.component').then(
        (m) => m.ColorPickerDemoComponent,
      ),
  },
  {
    path: 'wrapper-ui-test',
    loadComponent: () =>
      import('./wrapper-ui-test/wrapper-ui-test.component').then((m) => m.WrapperUiTestComponent),
  },
  {
    path: 'button-demo',
    loadComponent: () =>
      import('./button-demo/button-demo.component').then((m) => m.ButtonDemoComponent),
  },
];
