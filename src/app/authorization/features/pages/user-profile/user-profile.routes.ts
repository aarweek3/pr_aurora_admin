import { Routes } from '@angular/router';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';

export const USER_PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfilePageComponent,
    title: 'Мой профиль',
  },
];
