import { Routes } from '@angular/router';
import { ProgramManagerComponent } from './program-manager.component';

export const PROGRAM_OF_AGGREGATOR_ROUTES: Routes = [
  {
    path: '',
    component: ProgramManagerComponent,
  },
  {
    path: 'new',
    loadComponent: () => import('./components/program-form/program-form.component').then(m => m.ProgramFormComponent),
    data: { title: 'Добавить программу' }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/program-form/program-form.component').then(m => m.ProgramFormComponent),
    data: { title: 'Редактировать программу' }
  }
];
