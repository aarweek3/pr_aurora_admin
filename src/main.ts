import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

if (typeof window !== 'undefined') {
  // === ПАТЧ ДЛЯ NG-ZORRO: Защита от ошибок с window/document до инициализации DOM ===
  const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');

  // Переопределяем innerWidth с защитой от ошибок
  Object.defineProperty(window, 'innerWidth', {
    get: function () {
      try {
        const val = originalInnerWidth?.get?.call(window);
        return typeof val === 'number' ? val : 1920;
      } catch {
        return 1920; // Безопасный fallback
      }
    },
    configurable: true,
  });

  // Переопределяем innerHeight с защитой от ошибок
  Object.defineProperty(window, 'innerHeight', {
    get: function () {
      try {
        const val = originalInnerHeight?.get?.call(window);
        return typeof val === 'number' ? val : 1080;
      } catch {
        return 1080; // Безопасный fallback
      }
    },
    configurable: true,
  });

  // Глобальная конфигурация TinyMCE (предотвращает checkout popup и лицензионные ошибки)
  (window as any).tinyMCEGlobalConfig = {
    license_key: 'gpl',
    promotion: false,
    branding: false,
    // Отключить попытки загрузки внешних плагинов/чекаута
    plugins_url: false,
  };

  // === ПАТЧ ДЛЯ ЗАГЛУШКИ КРИВЫХ ВОРНИНГОВ И ОШИБОК NG-ZORRO/TINYMCE ===
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('tabSwitchMotion') ||
      msg.includes('not animatable properties: display') ||
      msg.includes('ResizeObserver loop limit exceeded')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    if (msg.includes('No checkout popup config found')) {
      return;
    }
    originalError.apply(console, args);
  };
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
