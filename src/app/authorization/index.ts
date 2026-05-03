// src/app/authorization/index.ts
/**
 * Единый источник правды для модуля авторизации.
 * Этот модуль спроектирован как автономный и переносимый.
 */

// 1. Core Logic (Services, Models, Guards)
export * from './core';

// 2. Shared UI (Directives, Pipes, Common Components)
export * from './shared';

// 3. Feature Pages
export * from './features';

// 4. Routes
export * from './routes';
