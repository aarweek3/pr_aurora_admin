import { Routes } from '@angular/router';
import { PlatformPageComponent } from './components/platform-page/platform-page.component';
import { PlatformManagerComponent } from './platform-manager.component';

export const PLATFORM_MANAGER_ROUTES: Routes = [
  {
    path: '',
    component: PlatformManagerComponent,
  },
  {
    path: 'new',
    component: PlatformPageComponent,
  },
  {
    path: ':id/edit',
    component: PlatformPageComponent,
  },
];
