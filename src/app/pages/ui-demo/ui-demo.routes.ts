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
    loadComponent: () =>
      import('./old-control/button-ui/button-ui.component').then((m) => m.ButtonUiComponent),
  },
  {
    path: 'button-ui-new',
    loadComponent: () =>
      import('./old-control/button-ui-new/button-ui-new.component').then(
        (m) => m.ButtonUiNewComponent,
      ),
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
    path: 'toggle-control-aurora',
    loadComponent: () =>
      import('./toggle-control-aurora/toggle-control-aurora.component').then(
        (m) => m.ToggleControlAuroraComponent,
      ),
  },
  {
    path: 'input-control-aurora',
    loadComponent: () =>
      import('./input-control-aurora/input-control-aurora.component').then(
        (m) => m.InputControlAuroraComponent,
      ),
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
    loadComponent: () =>
      import('./old-control/icon-ui/icon-ui.component').then((m) => m.IconUiComponent),
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
    path: 'modal-control-aurora',
    loadComponent: () =>
      import('./modal-control-aurora/modal-control-aurora.component').then(
        (m) => m.ModalControlAuroraComponent,
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
    path: 'dialog-control-aurora',
    loadComponent: () =>
      import('./dialog-control-aurora/dialog-control-aurora.component').then(
        (m) => m.DialogControlAuroraComponent,
      ),
  },
  {
    path: 'field-group-ui',
    loadComponent: () =>
      import('./field-group-ui/field-group-ui.component').then((m) => m.FieldGroupUiComponent),
  },
  {
    path: 'field-group-component-aurora',
    loadComponent: () =>
      import('./field-group-component-aurora/field-group-control-aurora.component').then(
        (m) => m.FieldGroupControlAuroraComponent,
      ),
  },
  {
    path: 'search-ui',
    loadComponent: () => import('./search-ui/search-ui.component').then((m) => m.SearchUiComponent),
  },
  {
    path: 'search-control-aurora',
    loadComponent: () =>
      import('./search-control-aurora/search-control-aurora.component').then(
        (m) => m.SearchControlAuroraComponent,
      ),
  },
  {
    path: 'tag-ui',
    loadComponent: () => import('./tag-ui/tag-ui.component').then((m) => m.TagUiComponent),
  },
  {
    path: 'tag-control-aurora',
    loadComponent: () =>
      import('./tag-control-aurora/tag-control-aurora.component').then(
        (m) => m.TagControlAuroraComponent,
      ),
  },
  {
    path: 'pagination-ui',
    loadComponent: () =>
      import('./pagination-ui/pagination-ui.component').then((m) => m.PaginationUiComponent),
  },
  {
    path: 'pagination-control-aurora',
    loadComponent: () =>
      import('./pagination-control-aurora/pagination-control-aurora.component').then(
        (m) => m.PaginationControlAuroraComponent,
      ),
  },
  {
    path: 'help-copy-container-ui',
    loadComponent: () =>
      import('./av-help-copy-container-ui/av-help-copy-container-ui.component').then(
        (m) => m.HelpCopyContainerUiComponent,
      ),
  },
  {
    path: 'help-container-control-aurora',
    loadComponent: () =>
      import('./help-container-control-aurora/help-container-control-aurora.component').then(
        (m) => m.HelpContainerControlAuroraComponent,
      ),
  },
  {
    path: 'spinner-ui',
    loadComponent: () =>
      import('./spinner-ui/spinner-ui.component').then((m) => m.SpinnerUiComponent),
  },
  {
    path: 'spinner-control-aurora',
    loadComponent: () =>
      import('./spinner-control-aurora/spinner-control-aurora.component').then(
        (m) => m.SpinnerControlAuroraComponent,
      ),
  },
  {
    path: 'progress-ui',
    loadComponent: () =>
      import('./progress-ui/progress-ui.component').then((m) => m.ProgressUiComponent),
  },
  {
    path: 'progress-bar-control-aurora',
    loadComponent: () =>
      import('./progress-bar-control-aurora/progress-bar-control-aurora.component').then(
        (m) => m.ProgressBarControlAuroraComponent,
      ),
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
