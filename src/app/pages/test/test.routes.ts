import { Routes } from '@angular/router';

export const TEST_ROUTES: Routes = [
  {
    path: 'ui-help-base',
    loadComponent: () =>
      import('../../shared/containers/ui-help/container-ui-help-base/container-ui-help-base.component').then(
        (m) => m.ContainerUiHelpBaseComponent
      ),
  },
];
