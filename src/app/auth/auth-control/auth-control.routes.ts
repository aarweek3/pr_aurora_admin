import { Routes } from '@angular/router';
import { AuthControlDashboardComponent } from './components/auth-control-dashboard/auth-control-dashboard.component';

export const AUTH_CONTROL_ROUTES: Routes = [
  {
    path: '',
    component: AuthControlDashboardComponent,
    title: 'Auth Control Panel',
  },
];
