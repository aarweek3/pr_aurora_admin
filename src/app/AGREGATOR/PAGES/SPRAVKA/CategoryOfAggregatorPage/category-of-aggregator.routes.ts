import { Routes } from '@angular/router';
import { CategoryOfAggregatorManagerComponent } from './category-of-aggregator-manager.component';

export const CATEGORY_OF_AGGREGATOR_ROUTES: Routes = [
  {
    path: '',
    component: CategoryOfAggregatorManagerComponent,
    children: [
      // Можно добавить дочерние маршруты для режима 'page' если потребуется
    ]
  }
];

export default CATEGORY_OF_AGGREGATOR_ROUTES;
