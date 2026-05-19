import { Routes } from '@angular/router';
import { PlatformOfAggregatorManagerComponent } from './platform-of-aggregator-manager.component';
import { PlatformOfAggregatorPageFormComponent } from './components/platform-of-aggregator-page-form/platform-of-aggregator-page-form.component';

export const PLATFORM_OF_AGGREGATOR_ROUTES: Routes = [
  {
    path: '',
    component: PlatformOfAggregatorManagerComponent,
    data: { breadcrumb: 'Операционные системы' },
  },
  {
    path: 'new',
    component: PlatformOfAggregatorPageFormComponent,
    data: { breadcrumb: 'Новая платформа' },
  },
  {
    path: ':id/edit',
    component: PlatformOfAggregatorPageFormComponent,
    data: { breadcrumb: 'Редактирование платформы' },
  },
];
