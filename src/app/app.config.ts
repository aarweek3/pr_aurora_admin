import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { routes } from './app.routes';

// Import all icons (for dev purposes, production should be selective)
const antDesignIcons = AllIcons as { [key: string]: IconDefinition };
const icons: IconDefinition[] = Object.keys(antDesignIcons).map((key) => antDesignIcons[key]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        // TODO: Add authInterceptor (Phase 6)
        // TODO: Add httpErrorInterceptor (Phase 2)
        // TODO: Add loadingInterceptor (Phase 8??)
      ]),
    ),

    provideAnimations(),

    importProvidersFrom(NzModalModule),

    provideNzConfig({
      message: { nzTop: 24, nzDuration: 5000 },
      notification: { nzTop: 24, nzDuration: 5000 },
      // mode: 'modal' // For global configuration if needed
    }),

    provideNzIcons(icons),

    // TODO: Add APP_INITIALIZER for ContextService, ErrorRegistry (Phase 2)
  ],
};
