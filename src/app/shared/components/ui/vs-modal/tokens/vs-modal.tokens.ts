import { InjectionToken } from '@angular/core';
import { VSModalConfig } from '../models/vs-modal.config';

/**
 * Токен для передачи входных данных в компонент, открытый в VS модале
 */
export const VS_MODAL_DATA = new InjectionToken<any>('VS_MODAL_DATA');

/**
 * Токен для внутренней конфигурации контейнера
 */
export const VS_MODAL_CONFIG = new InjectionToken<VSModalConfig>('VS_MODAL_CONFIG');
