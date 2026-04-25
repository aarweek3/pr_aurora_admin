import { Routes } from '@angular/router';
import { DeveloperOfAggregatorManagerComponent } from './developer-of-aggregator-manager.component';
import { DeveloperOfAggregatorPageFormComponent } from './components/developer-of-aggregator-page-form/developer-of-aggregator-page-form.component';

export const DEVELOPER_OF_AGGREGATOR_ROUTES: Routes = [
  {
    path: '',
    component: DeveloperOfAggregatorManagerComponent,
    data: { breadcrumb: 'Разработчики' }
  },
  {
    path: 'new',
    component: DeveloperOfAggregatorPageFormComponent,
    data: { breadcrumb: 'Новый разработчик' }
  },
  {
    path: ':id/edit',
    component: DeveloperOfAggregatorPageFormComponent,
    data: { breadcrumb: 'Редактирование разработчика' }
  }
];
