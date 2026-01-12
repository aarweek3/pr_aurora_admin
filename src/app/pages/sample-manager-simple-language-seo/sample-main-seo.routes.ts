import { Routes } from '@angular/router';
import { SampleMainSeoPageComponent } from './components/sample-main-seo-page/sample-main-seo-page.component';
import { SampleMainSeoManagerComponent } from './sample-main-seo-manager.component';

export const SAMPLE_MAIN_SEO_ROUTES: Routes = [
  {
    path: '',
    component: SampleMainSeoManagerComponent,
  },
  {
    path: 'new',
    component: SampleMainSeoPageComponent,
  },
  {
    path: ':id/edit',
    component: SampleMainSeoPageComponent,
  },
];
