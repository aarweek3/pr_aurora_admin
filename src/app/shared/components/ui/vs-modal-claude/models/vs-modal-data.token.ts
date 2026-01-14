import { InjectionToken } from '@angular/core';

/**
 * Injection token для передачи данных в модальное окно
 */
export const VS_MODAL_DATA = new InjectionToken<any>('VS_MODAL_DATA');

/**
 * Injection token для передачи конфигурации в VSModalContainer
 */
export const VS_MODAL_CONFIG = new InjectionToken<any>('VS_MODAL_CONFIG');
