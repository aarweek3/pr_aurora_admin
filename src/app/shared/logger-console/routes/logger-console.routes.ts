import { Routes } from '@angular/router';

export const LOGGER_CONSOLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../components/logger-console-demo/logger-console-demo.component').then(
        (c) => c.LoggerConsoleDemoComponent,
      ),
  },
];
