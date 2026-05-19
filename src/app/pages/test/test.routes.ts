import { Routes } from '@angular/router';
import { SampleMainManagerComponent } from '../sample-manager-simple-language/components/sample-main-manager/sample-main-manager.component';
import { SimpleManagerComponent } from '../sample-manager-simple/components/simple-manager/simple-manager.component';

export const TEST_ROUTES: Routes = [
  {
    path: 'ui-help-base',
    loadComponent: () =>
      import('../../shared/containers/ui-help/container-ui-help-base/container-ui-help-base.component').then(
        (m) => m.ContainerUiHelpBaseComponent,
      ),
  },
  {
    path: 'sample-control-test',
    loadComponent: () =>
      import('../sample-control/sample-control-test/sample-control-test.component').then(
        (m) => m.SampleControlTestComponent,
      ),
  },
  {
    path: 'sample-manager',
    loadComponent: () =>
      import('../sample-manager/components/sample-manager/sample-manager.component').then(
        (m) => m.SampleManagerComponent,
      ),
  },
  {
    path: 'sample-manager-simple',
    component: SimpleManagerComponent,
  },
  {
    path: 'sample-manager-simple-language',
    component: SampleMainManagerComponent,
  },
  {
    path: 'image-uni',
    loadComponent: () =>
      import('./test-image-uni/test-image-uni.component').then((m) => m.TestImageUniComponent),
  },
  {
    path: 'rating',
    loadComponent: () =>
      import('../debug-tools/test-rating/test-rating.component').then((m) => m.TestRatingComponent),
  },
  {
    path: 'help-universal',
    loadComponent: () =>
      import('../../shared/components/test-components/test-help-modal/test-help-modal.component').then(
        (m) => m.TestHelpModalComponent,
      ),
  },
];
