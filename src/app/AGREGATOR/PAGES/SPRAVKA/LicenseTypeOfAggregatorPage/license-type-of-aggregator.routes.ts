import { Routes } from '@angular/router';
import { LicenseTypeOfAggregatorManagerComponent } from './license-type-of-aggregator-manager.component';
import { LicenseTypeOfAggregatorPageFormComponent } from './components/license-type-of-aggregator-page-form/license-type-of-aggregator-page-form.component';

export const LICENSE_TYPE_OF_AGGREGATOR_ROUTES: Routes = [
  {
    path: '',
    component: LicenseTypeOfAggregatorManagerComponent,
  },
  {
    path: 'new',
    component: LicenseTypeOfAggregatorPageFormComponent,
    data: { mode: 'add' },
  },
  {
    path: ':id/edit',
    component: LicenseTypeOfAggregatorPageFormComponent,
    data: { mode: 'edit' },
  },
];
