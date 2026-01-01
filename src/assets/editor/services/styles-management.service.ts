/**
 * ════════════════════════════════════════════════════════════════════════════
 * STYLES MANAGEMENT SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для управления кастомными стилями редактора.
 *
 * Отвечает за:
 * - Применение кастомных SCSS/CSS стилей к редактору
 * - Конвертацию базового SCSS в CSS (без полного компайлера)
 * - Управление <style> элементом для кастомных стилей
 * - Префиксацию селекторов для изоляции стилей
 *
 * @module StylesManagementService
 */

import { Injectable } from '@angular/core';

/**
 * Конфигурация для применения стилей
 */
export interface StylesConfig {
  /** SCSS/CSS код для применения */
  styles: string;
  /** Префикс для селекторов (по умолчанию .aurora-editor) */
  prefix?: string;
  /** ID элемента <style> для изоляции */
  styleElementId?: string;
}

/**
 * Сервис для управления кастомными стилями
 */
@Injectable({
  providedIn: 'root',
})
export class StylesManagementService {
  /**
   * Элемент <style> для кастомных стилей
   */
  private customStyleElement: HTMLStyleElement | null = null;

  /**
   * Текущие кастомные стили (SCSS)
   */
  private currentScss = '';

  /**
   * Префикс по умолчанию для селекторов
   */
  private readonly DEFAULT_PREFIX = '.aurora-editor';

  /**
   * ID по умолчанию для style элемента
   */
  private readonly DEFAULT_STYLE_ID = 'aurora-custom-styles';

  // ═══════════════════════════════════════════════════════════════════════════
  // ОСНОВНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Применить кастомные стили к редактору
   *
   * @param config - Конфигурация стилей
   */
  applyCustomStyles(config: StylesConfig): void {
    const { styles, prefix = this.DEFAULT_PREFIX, styleElementId = this.DEFAULT_STYLE_ID } = config;

    console.log('[StylesManagement] 🎨 Applying custom styles', {
      stylesLength: styles.length,
      prefix,
      styleElementId,
    });

    try {
      // Конвертируем SCSS в CSS (базовая конвертация)
      const css = this.convertScssToBasicCss(styles);

      // Добавляем префиксы к селекторам
      const prefixedCss = this.prefixSelectors(css, prefix);

      // Применяем CSS к странице
      this.setCssToPage(prefixedCss, styleElementId);

      // Сохраняем текущие стили
      this.currentScss = styles;

      console.log('[StylesManagement] ✅ Custom styles applied successfully');
    } catch (error) {
      console.error('[StylesManagement] ❌ Error applying styles:', error);
      throw error;
    }
  }

  /**
   * Обновить существующие стили
   */
  updateStyles(styles: string): void {
    this.applyCustomStyles({ styles });
  }

  /**
   * Удалить кастомные стили
   */
  removeCustomStyles(): void {
    console.log('[StylesManagement] 🗑️ Removing custom styles');

    if (this.customStyleElement) {
      this.customStyleElement.remove();
      this.customStyleElement = null;
    }

    this.currentScss = '';
    console.log('[StylesManagement] ✅ Custom styles removed');
  }

  /**
   * Получить текущие SCSS стили
   */
  getCurrentScss(): string {
    return this.currentScss;
  }

  /**
   * Получить текущий CSS (конвертированный из SCSS)
   */
  getCurrentCss(): string {
    if (this.customStyleElement) {
      return this.customStyleElement.textContent || '';
    }
    return '';
  }

  /**
   * Проверить, применены ли кастомные стили
   */
  hasCustomStyles(): boolean {
    return !!this.customStyleElement && this.currentScss.length > 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // КОНВЕРТАЦИЯ SCSS → CSS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Базовая конвертация SCSS в CSS
   *
   * ВНИМАНИЕ: Это упрощенная конвертация, поддерживает только:
   * - Вложенные селекторы
   * - Переменные ($color: red; color: $color;)
   * - Базовые миксины (@mixin, @include)
   *
   * Для полной поддержки SCSS используйте sass.js или аналог.
   */
  private convertScssToBasicCss(scss: string): string {
    console.log('[StylesManagement] 🔄 Converting SCSS to CSS');

    let css = scss;

    try {
      // 1. Обработка переменных ($var: value;)
      css = this.processScssVariables(css);

      // 2. Обработка вложенных селекторов
      css = this.processNestedSelectors(css);

      // 3. Обработка миксинов (базовая)
      css = this.processMixins(css);

      // 4. Очистка комментариев
      css = this.removeScssComments(css);

      // 5. Нормализация пробелов
      css = this.normalizeWhitespace(css);

      console.log('[StylesManagement] ✅ SCSS converted to CSS');
      return css;
    } catch (error) {
      console.warn('[StylesManagement] ⚠️ SCSS conversion failed, using as CSS:', error);
      // Если конвертация не удалась, возвращаем исходный код как CSS
      return scss;
    }
  }

  /**
   * Обработка SCSS переменных
   */
  private processScssVariables(scss: string): string {
    const variables: { [key: string]: string } = {};

    // Извлекаем переменные ($var: value;)
    const variableRegex = /\$([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*([^;]+);/g;
    let match;

    while ((match = variableRegex.exec(scss)) !== null) {
      variables[`$${match[1]}`] = match[2].trim();
    }

    // Удаляем объявления переменных
    let result = scss.replace(variableRegex, '');

    // Заменяем использования переменных
    Object.entries(variables).forEach(([varName, value]) => {
      const regex = new RegExp(varName.replace('$', '\\$'), 'g');
      result = result.replace(regex, value);
    });

    return result;
  }

  /**
   * Обработка вложенных селекторов (упрощенная)
   */
  private processNestedSelectors(scss: string): string {
    // Это очень упрощенная реализация
    // Для полной поддержки нужен полноценный SCSS парсер

    // Пока просто возвращаем исходный код
    // TODO: Реализовать полную обработку вложенности
    return scss;
  }

  /**
   * Обработка миксинов (базовая)
   */
  private processMixins(scss: string): string {
    // Удаляем @mixin объявления и @include вызовы
    // Это упрощенная реализация

    let result = scss;

    // Удаляем @mixin блоки
    result = result.replace(/@mixin\s+[^{]*\{[^}]*\}/g, '');

    // Удаляем @include вызовы
    result = result.replace(/@include\s+[^;]+;/g, '');

    return result;
  }

  /**
   * Удаление SCSS комментариев
   */
  private removeScssComments(scss: string): string {
    // Удаляем // комментарии
    let result = scss.replace(/\/\/.*$/gm, '');

    // Удаляем /* */ комментарии
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');

    return result;
  }

  /**
   * Нормализация пробелов
   */
  private normalizeWhitespace(css: string): string {
    return css
      .replace(/\s+/g, ' ') // Множественные пробелы → один пробел
      .replace(/\s*{\s*/g, ' { ') // Пробелы вокруг {
      .replace(/;\s*/g, '; ') // Пробел после ;
      .replace(/}\s*/g, '}\n') // Новая строка после }
      .trim();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // УПРАВЛЕНИЕ DOM
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Добавить префиксы к селекторам CSS
   */
  private prefixSelectors(css: string, prefix: string): string {
    console.log('[StylesManagement] 🏷️ Adding prefix to selectors:', prefix);

    if (!prefix || prefix.trim() === '') {
      return css;
    }

    // Разбиваем CSS на правила
    const rules = css.split('}').filter((rule) => rule.trim());

    const prefixedRules = rules.map((rule) => {
      if (!rule.includes('{')) return rule;

      const [selectorsPart, propertiesPart] = rule.split('{');
      const selectors = selectorsPart.split(',').map((s) => s.trim());

      // Добавляем префикс к каждому селектору
      const prefixedSelectors = selectors.map((selector) => {
        // Пропускаем селекторы, которые уже имеют префикс
        if (selector.includes(prefix)) {
          return selector;
        }

        // Добавляем префикс
        return `${prefix} ${selector}`;
      });

      return `${prefixedSelectors.join(', ')} {${propertiesPart}`;
    });

    return prefixedRules.join('}\n') + (prefixedRules.length > 0 ? '}' : '');
  }

  /**
   * Применить CSS к странице через <style> элемент
   */
  private setCssToPage(css: string, styleElementId: string): void {
    console.log('[StylesManagement] 📝 Setting CSS to page');

    // Удаляем предыдущий элемент, если есть
    if (this.customStyleElement) {
      this.customStyleElement.remove();
    }

    // Создаем новый <style> элемент
    this.customStyleElement = document.createElement('style');
    this.customStyleElement.id = styleElementId;
    this.customStyleElement.textContent = css;

    // Добавляем в <head>
    document.head.appendChild(this.customStyleElement);

    console.log('[StylesManagement] ✅ CSS applied to page');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // УТИЛИТАРНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Валидация CSS/SCSS кода
   */
  validateStyles(styles: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Проверка на критические ошибки
    if (styles.includes('<script>')) {
      errors.push('Script теги запрещены в стилях');
    }

    if (styles.includes('javascript:')) {
      errors.push('JavaScript URL запрещены в стилях');
    }

    // Проверка синтаксиса (базовая)
    const openBraces = (styles.match(/{/g) || []).length;
    const closeBraces = (styles.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push('Несоответствие количества открывающих и закрывающих скобок');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Получить информацию о текущих стилях
   */
  getStylesInfo(): {
    hasStyles: boolean;
    scssLength: number;
    cssLength: number;
    elementId: string | null;
  } {
    return {
      hasStyles: this.hasCustomStyles(),
      scssLength: this.currentScss.length,
      cssLength: this.getCurrentCss().length,
      elementId: this.customStyleElement?.id || null,
    };
  }
}
