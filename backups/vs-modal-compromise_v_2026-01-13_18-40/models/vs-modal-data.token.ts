import { InjectionToken } from '@angular/core';
import { VSModalConfig } from './vs-modal-config.model';

/**
 * Токен для передачи входных данных в компонент
 */
export const VS_MODAL_DATA = new InjectionToken<any>('VS_MODAL_DATA');

/**
 * Токен для передачи конфигурации в контейнер
 */
export const VS_MODAL_CONFIG = new InjectionToken<VSModalConfig>('VS_MODAL_CONFIG');
