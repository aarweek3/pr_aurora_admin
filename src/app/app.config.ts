import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import ru from '@angular/common/locales/ru';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { NZ_I18N, ru_RU } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

registerLocaleData(ru);

import { routes } from './app.routes';
import { GlobalErrorHandler } from './shared/infrastructure/interceptor/services/global-error-handler.service';
import { HttpErrorInterceptor } from './shared/infrastructure/interceptor/services/http-error.interceptor';
import { HttpRequestLoggerInterceptor } from './shared/infrastructure/interceptor/services/http-request-logger.interceptor';

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
        HttpRequestLoggerInterceptor, // Логирование запросов
        HttpErrorInterceptor, // Phase 2 - HTTP Error Handling
        // TODO: Add authInterceptor (Phase 6)
        // TODO: Add loadingInterceptor (Phase 8)
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

    { provide: NZ_I18N, useValue: ru_RU },

    // Phase 2 - Global Error Handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },

    // TODO: Add APP_INITIALIZER for ContextService, ErrorRegistry (Phase 2)
  ],
};
