/**
 * ════════════════════════════════════════════════════════════════════════════
 * NORMALIZE DOM UTILITIES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Утилиты для нормализации DOM структуры редактора.
 *
 * Основные задачи:
 * - Замена устаревших тегов (b→strong, i→em)
 * - Safari fix (inline styles → semantic tags)
 * - Firefox fix (удаление лишних <br>)
 * - Удаление вложенных дубликатов
 * - Объединение соседних одинаковых тегов
 * - Удаление пустых элементов
 *
 * @module NormalizeDomUtils
 */

// ════════════════════════════════════════════════════════════════════════════
// КОНСТАНТЫ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Маппинг устаревших тегов на современные эквиваленты
 */
const DEPRECATED_TAGS_MAP: Record<string, string> = {
  b: 'strong',
  i: 'em',
  u: 'u', // u остается u (подчеркивание), но проверяем стили
  strike: 'del',
  s: 'del',
};

/**
 * Маппинг inline стилей на семантические теги (Safari fix)
 */
interface StyleToTagMapping {
  style: string;
  value: string | string[];
  tag: string;
}

const STYLE_TO_TAG_MAP: StyleToTagMapping[] = [
  { style: 'font-weight', value: ['bold', '700', '600'], tag: 'strong' },
  { style: 'font-style', value: 'italic', tag: 'em' },
  { style: 'text-decoration', value: 'underline', tag: 'u' },
  { style: 'text-decoration', value: 'line-through', tag: 'del' },
];

/**
 * Теги, которые считаются "пустыми" и подлежат удалению
 * (кроме <br>, <img>, <hr> и других self-closing тегов)
 */
const SELF_CLOSING_TAGS = new Set(['br', 'img', 'hr', 'input']);

// ════════════════════════════════════════════════════════════════════════════
// ГЛАВНАЯ ФУНКЦИЯ НОРМАЛИЗАЦИИ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Нормализует DOM структуру редактора
 *
 * @param element - Корневой элемент редактора для нормализации
 *
 * @remarks
 * Выполняет следующие операции:
 * 1. Замена устаревших тегов (b→strong, i→em)
 * 2. Конвертация inline styles в семантические теги (Safari fix)
 * 3. Удаление вложенных дубликатов тегов
 * 4. Объединение соседних одинаковых тегов
 * 5. Удаление пустых элементов
 * 6. Удаление лишних <br> (Firefox fix)
 *
 * Все операции обёрнуты в try-catch для предотвращения падения редактора.
 *
 * @example
 * ```typescript
 * const editor = document.querySelector('[contenteditable]');
 * normalizeDOM(editor);
 * ```
 */
export function normalizeDOM(element: HTMLElement | null): void {
  if (!element) {
    console.warn('[NormalizeDOM] Element is null, skipping normalization');
    return;
  }

  try {
    console.log('[NormalizeDOM] Starting normalization');

    // 1. Замена устаревших тегов
    replaceDeprecatedTags(element);

    // 2. Safari fix: inline styles → semantic tags
    convertInlineStylesToTags(element);

    // 3. Удаление вложенных дубликатов
    removeNestedDuplicates(element);

    // 4. Объединение соседних одинаковых тегов
    mergeSiblingTags(element);

    // 5. Удаление пустых элементов
    removeEmptyElements(element);

    // 6. Firefox fix: удаление лишних <br>
    removeExcessiveBr(element);

    console.log('[NormalizeDOM] Normalization completed successfully');
  } catch (error) {
    console.error('[NormalizeDOM] Error during normalization:', error);
    // Не пробрасываем ошибку выше - редактор должен продолжать работать
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Заменяет устаревшие теги на современные эквиваlenты
 * (b→strong, i→em, strike→del)
 *
 * @param element - Корневой элемент для обработки
 */
function replaceDeprecatedTags(element: HTMLElement): void {
  try {
    Object.keys(DEPRECATED_TAGS_MAP).forEach((oldTag) => {
      const nodes = Array.from(element.querySelectorAll(oldTag));

      nodes.forEach((node) => {
        const newTag = DEPRECATED_TAGS_MAP[oldTag];
        const replacement = document.createElement(newTag);

        // Копируем атрибуты
        Array.from(node.attributes).forEach((attr) => {
          replacement.setAttribute(attr.name, attr.value);
        });

        // Переносим содержимое
        replacement.innerHTML = node.innerHTML;

        // Заменяем в DOM
        node.parentNode?.replaceChild(replacement, node);
      });
    });

    console.log('[NormalizeDOM] Deprecated tags replaced');
  } catch (error) {
    console.error('[NormalizeDOM] Error replacing deprecated tags:', error);
  }
}

/**
 * Конвертирует inline styles в семантические теги
 * (Safari часто создаёт span с inline styles вместо семантических тегов)
 *
 * @param element - Корневой элемент для обработки
 */
function convertInlineStylesToTags(element: HTMLElement): void {
  try {
    const spans = Array.from(element.querySelectorAll('span[style]'));

    spans.forEach((span) => {
      const computedStyle = window.getComputedStyle(span);
      let wrapperTag: string | null = null;

      // Проверяем каждый маппинг стилей
      for (const mapping of STYLE_TO_TAG_MAP) {
        const styleValue = computedStyle.getPropertyValue(mapping.style);

        const matchValues = Array.isArray(mapping.value) ? mapping.value : [mapping.value];

        if (matchValues.some((val) => styleValue.includes(val))) {
          wrapperTag = mapping.tag;
          break;
        }
      }

      if (wrapperTag) {
        const wrapper = document.createElement(wrapperTag);
        wrapper.innerHTML = span.innerHTML;

        // Копируем остальные атрибуты (кроме style)
        Array.from(span.attributes).forEach((attr) => {
          if (attr.name !== 'style') {
            wrapper.setAttribute(attr.name, attr.value);
          }
        });

        span.parentNode?.replaceChild(wrapper, span);
      }
    });

    console.log('[NormalizeDOM] Inline styles converted to semantic tags');
  } catch (error) {
    console.error('[NormalizeDOM] Error converting inline styles:', error);
  }
}

/**
 * Удаляет вложенные дубликаты тегов
 * (например, <strong><strong>text</strong></strong> → <strong>text</strong>)
 *
 * @param element - Корневой элемент для обработки
 */
function removeNestedDuplicates(element: HTMLElement): void {
  try {
    const tagsToCheck = ['strong', 'em', 'u', 'del', 'code', 'mark'];

    tagsToCheck.forEach((tag) => {
      let changed = true;

      // Повторяем пока есть изменения
      while (changed) {
        changed = false;

        const nodes = Array.from(element.querySelectorAll(tag));

        nodes.forEach((node) => {
          // Проверяем родителя
          if (node.parentElement && node.parentElement.tagName.toLowerCase() === tag) {
            // Перемещаем содержимое на уровень выше
            const parent = node.parentElement;
            const fragment = document.createDocumentFragment();

            Array.from(node.childNodes).forEach((child) => {
              fragment.appendChild(child.cloneNode(true));
            });

            parent.replaceChild(fragment, node);
            changed = true;
          }
        });
      }
    });

    console.log('[NormalizeDOM] Nested duplicates removed');
  } catch (error) {
    console.error('[NormalizeDOM] Error removing nested duplicates:', error);
  }
}

/**
 * Объединяет соседние одинаковые теги
 * (например, <strong>Hello</strong><strong> World</strong> → <strong>Hello World</strong>)
 *
 * @param element - Корневой элемент для обработки
 */
function mergeSiblingTags(element: HTMLElement): void {
  try {
    const tagsToMerge = ['strong', 'em', 'u', 'del', 'code', 'mark', 'a'];

    tagsToMerge.forEach((tag) => {
      let changed = true;

      while (changed) {
        changed = false;

        const nodes = Array.from(element.querySelectorAll(tag));

        nodes.forEach((node) => {
          const next = node.nextSibling;

          // Проверяем, что следующий элемент - это такой же тег
          if (
            next &&
            next.nodeType === Node.ELEMENT_NODE &&
            (next as Element).tagName.toLowerCase() === tag
          ) {
            // Для ссылок дополнительно проверяем href
            if (tag === 'a') {
              const currentHref = (node as HTMLAnchorElement).href;
              const nextHref = (next as HTMLAnchorElement).href;

              if (currentHref !== nextHref) {
                return; // Не объединяем ссылки с разными href
              }
            }

            // Объединяем содержимое
            Array.from(next.childNodes).forEach((child) => {
              node.appendChild(child.cloneNode(true));
            });

            // Удаляем следующий узел
            next.parentNode?.removeChild(next);
            changed = true;
          }
        });
      }
    });

    console.log('[NormalizeDOM] Sibling tags merged');
  } catch (error) {
    console.error('[NormalizeDOM] Error merging sibling tags:', error);
  }
}

/**
 * Удаляет пустые элементы (кроме self-closing тегов как <br>, <img>)
 *
 * @param element - Корневой элемент для обработки
 */
function removeEmptyElements(element: HTMLElement): void {
  try {
    let changed = true;

    while (changed) {
      changed = false;

      const allElements = Array.from(element.querySelectorAll('*'));

      allElements.forEach((node) => {
        const tagName = node.tagName.toLowerCase();

        // Пропускаем self-closing теги
        if (SELF_CLOSING_TAGS.has(tagName)) {
          return;
        }

        // Проверяем, пустой ли элемент
        const isEmpty = node.textContent?.trim() === '' && node.children.length === 0;

        if (isEmpty) {
          node.parentNode?.removeChild(node);
          changed = true;
        }
      });
    }

    console.log('[NormalizeDOM] Empty elements removed');
  } catch (error) {
    console.error('[NormalizeDOM] Error removing empty elements:', error);
  }
}

/**
 * Удаляет избыточные <br> теги (Firefox fix)
 *
 * Firefox иногда добавляет лишние <br> для пустых строк.
 * Удаляем множественные подряд идущие <br> (оставляем максимум 2).
 *
 * @param element - Корневой элемент для обработки
 */
function removeExcessiveBr(element: HTMLElement): void {
  try {
    const allNodes = Array.from(element.querySelectorAll('br'));

    allNodes.forEach((br) => {
      let consecutiveBrCount = 1;
      let next = br.nextSibling;

      // Считаем подряд идущие <br>
      while (
        next &&
        next.nodeType === Node.ELEMENT_NODE &&
        (next as Element).tagName.toLowerCase() === 'br'
      ) {
        consecutiveBrCount++;
        next = next.nextSibling;
      }

      // Если больше 2 подряд - удаляем лишние
      if (consecutiveBrCount > 2) {
        let current = br.nextSibling;
        let removed = 0;

        while (
          current &&
          removed < consecutiveBrCount - 2 &&
          current.nodeType === Node.ELEMENT_NODE &&
          (current as Element).tagName.toLowerCase() === 'br'
        ) {
          const toRemove = current;
          current = current.nextSibling;
          toRemove.parentNode?.removeChild(toRemove);
          removed++;
        }
      }
    });

    console.log('[NormalizeDOM] Excessive <br> tags removed');
  } catch (error) {
    console.error('[NormalizeDOM] Error removing excessive <br>:', error);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ЭКСПОРТ ВСПОМОГАТЕЛЬНЫХ ФУНКЦИЙ (для тестирования)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Экспорт вспомогательных функций для unit-тестирования
 * В production коде используйте только normalizeDOM()
 */
export const __testing__ = {
  replaceDeprecatedTags,
  convertInlineStylesToTags,
  removeNestedDuplicates,
  mergeSiblingTags,
  removeEmptyElements,
  removeExcessiveBr,
};
