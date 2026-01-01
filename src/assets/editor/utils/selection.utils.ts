/**
 * ════════════════════════════════════════════════════════════════════════════
 * SELECTION UTILITIES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Утилиты для сохранения и восстановления позиции курсора (selection)
 * в contenteditable элементе.
 *
 * Используется path-based подход для надёжного восстановления selection
 * даже после изменений DOM структуры.
 *
 * @module SelectionUtils
 */

import { SelectionPath } from '../types/editor.types';

// ════════════════════════════════════════════════════════════════════════════
// СОХРАНЕНИЕ SELECTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Сохраняет текущую позицию курсора (selection) в contenteditable элементе.
 *
 * Использует path-based подход:
 * - startPath: массив индексов от root до start node
 * - endPath: массив индексов от root до end node
 * - startOffset: смещение внутри start node
 * - endOffset: смещение внутри end node
 *
 * Также сохраняет absolute offsets как fallback для восстановления.
 *
 * @param root - Корневой элемент (editorElement)
 * @returns SelectionPath объект или null если selection отсутствует
 *
 * @example
 * const selection = saveSelection(editorElement);
 * if (selection) {
 *   console.log('Saved selection:', selection);
 * }
 */
export function saveSelection(root: HTMLElement): SelectionPath | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    console.warn('[Selection] No selection to save');
    return null;
  }

  const range = sel.getRangeAt(0);

  // Проверяем, что selection внутри root элемента
  if (!root.contains(range.commonAncestorContainer)) {
    console.warn('[Selection] Selection is outside root element');
    return null;
  }

  try {
    // Сохраняем path-based координаты
    const startContainerPath = getNodePath(root, range.startContainer);
    const endContainerPath = getNodePath(root, range.endContainer);

    // Сохраняем absolute offsets как fallback
    const absoluteStart = getAbsoluteOffset(root, range.startContainer, range.startOffset);
    const absoluteEnd = getAbsoluteOffset(root, range.endContainer, range.endOffset);

    const selectionPath: SelectionPath = {
      startContainerPath,
      endContainerPath,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      absoluteStart,
      absoluteEnd,
    };

    console.log('[Selection] Saved:', {
      startPath: selectionPath.startContainerPath,
      endPath: selectionPath.endContainerPath,
      offsets: `${selectionPath.startOffset}-${selectionPath.endOffset}`,
      absolute: `${selectionPath.absoluteStart}-${selectionPath.absoluteEnd}`,
    });

    return selectionPath;
  } catch (error) {
    console.error('[Selection] Error saving selection:', error);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ВОССТАНОВЛЕНИЕ SELECTION (PATH-BASED)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Восстанавливает позицию курсора по path-based координатам.
 *
 * Использует массивы индексов (startPath, endPath) для точного
 * восстановления selection после изменений DOM.
 *
 * @param root - Корневой элемент (editorElement)
 * @param selectionPath - Объект SelectionPath с координатами
 * @returns true если восстановление успешно, false в противном случае
 *
 * @example
 * const success = restoreSelection(editorElement, savedSelection);
 * if (!success) {
 *   console.warn('Failed to restore selection');
 * }
 */
export function restoreSelection(root: HTMLElement, selectionPath: SelectionPath): boolean {
  try {
    // Находим start и end nodes по path
    const startNode = getNodeByPath(root, selectionPath.startContainerPath);
    const endNode = getNodeByPath(root, selectionPath.endContainerPath);

    if (!startNode || !endNode) {
      console.warn('[Selection] Could not find nodes by path');
      return false;
    }

    // Проверяем, что offsets не выходят за границы
    const startOffset = Math.min(selectionPath.startOffset, getNodeLength(startNode));
    const endOffset = Math.min(selectionPath.endOffset, getNodeLength(endNode));

    // Создаём Range и устанавливаем selection
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    const sel = window.getSelection();
    if (!sel) {
      console.warn('[Selection] window.getSelection() returned null');
      return false;
    }

    sel.removeAllRanges();
    sel.addRange(range);

    console.log('[Selection] Restored by path:', {
      startPath: selectionPath.startContainerPath,
      endPath: selectionPath.endContainerPath,
      offsets: `${startOffset}-${endOffset}`,
    });

    return true;
  } catch (error) {
    console.error('[Selection] Error restoring selection by path:', error);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ВОССТАНОВЛЕНИЕ SELECTION (ABSOLUTE OFFSET FALLBACK)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Восстанавливает позицию курсора по абсолютным смещениям (fallback метод).
 *
 * Используется когда path-based восстановление не сработало.
 * Менее надёжен, но работает в большинстве случаев.
 *
 * @param root - Корневой элемент (editorElement)
 * @param selectionPath - Объект SelectionPath с absoluteStart/absoluteEnd
 * @returns true если восстановление успешно, false в противном случае
 *
 * @example
 * const success = restoreSelectionByAbsoluteOffset(editorElement, savedSelection);
 * if (!success) {
 *   // Fallback failed, use setCursorToEnd()
 * }
 */
export function restoreSelectionByAbsoluteOffset(
  root: HTMLElement,
  selectionPath: SelectionPath,
): boolean {
  try {
    const { absoluteStart, absoluteEnd } = selectionPath;

    if (absoluteStart === undefined || absoluteEnd === undefined) {
      console.warn('[Selection] Absolute offsets not available');
      return false;
    }

    // Находим nodes и offsets по абсолютным смещениям
    const startResult = getNodeByAbsoluteOffset(root, absoluteStart);
    const endResult = getNodeByAbsoluteOffset(root, absoluteEnd);

    if (!startResult || !endResult) {
      console.warn('[Selection] Could not find nodes by absolute offset');
      return false;
    }

    // Создаём Range и устанавливаем selection
    const range = document.createRange();
    range.setStart(startResult.node, startResult.offset);
    range.setEnd(endResult.node, endResult.offset);

    const sel = window.getSelection();
    if (!sel) {
      console.warn('[Selection] window.getSelection() returned null');
      return false;
    }

    sel.removeAllRanges();
    sel.addRange(range);

    console.log('[Selection] Restored by absolute offset:', {
      absoluteStart,
      absoluteEnd,
    });

    return true;
  } catch (error) {
    console.error('[Selection] Error restoring selection by absolute offset:', error);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ════════════════════════════════════════════════════════════════════════════

/**
 * Получает путь (массив индексов) от root до target node.
 *
 * @param root - Корневой элемент
 * @param target - Целевой node
 * @returns Массив индексов
 */
function getNodePath(root: Node, target: Node): number[] {
  const path: number[] = [];
  let current: Node | null = target;

  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) break;

    const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
    if (index === -1) break;

    path.unshift(index);
    current = parent;
  }

  return path;
}

/**
 * Получает node по пути (массиву индексов) от root.
 *
 * @param root - Корневой элемент
 * @param path - Массив индексов
 * @returns Node или null если путь невалиден
 */
function getNodeByPath(root: Node, path: number[]): Node | null {
  let current: Node = root;

  for (const index of path) {
    if (!current.childNodes || index >= current.childNodes.length) {
      return null;
    }
    current = current.childNodes[index];
  }

  return current;
}

/**
 * Получает абсолютное смещение (в символах) от начала root до target node + offset.
 *
 * @param root - Корневой элемент
 * @param target - Целевой node
 * @param offset - Смещение внутри target
 * @returns Абсолютное смещение в символах
 */
function getAbsoluteOffset(root: Node, target: Node, offset: number): number {
  let absoluteOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let currentNode: Node | null = walker.nextNode();

  while (currentNode) {
    if (currentNode === target) {
      return absoluteOffset + offset;
    }

    absoluteOffset += currentNode.textContent?.length || 0;
    currentNode = walker.nextNode();
  }

  // Если target не найден, возвращаем текущее смещение
  return absoluteOffset;
}

/**
 * Находит node и offset по абсолютному смещению (в символах) от начала root.
 *
 * @param root - Корневой элемент
 * @param absoluteOffset - Абсолютное смещение в символах
 * @returns Объект { node, offset } или null
 */
function getNodeByAbsoluteOffset(
  root: Node,
  absoluteOffset: number,
): { node: Node; offset: number } | null {
  let currentOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let currentNode: Node | null = walker.nextNode();

  while (currentNode) {
    const nodeLength = currentNode.textContent?.length || 0;

    if (currentOffset + nodeLength >= absoluteOffset) {
      return {
        node: currentNode,
        offset: absoluteOffset - currentOffset,
      };
    }

    currentOffset += nodeLength;
    currentNode = walker.nextNode();
  }

  // Если не нашли - возвращаем последний node
  if (walker.currentNode) {
    return {
      node: walker.currentNode,
      offset: walker.currentNode.textContent?.length || 0,
    };
  }

  return null;
}

/**
 * Получает длину (количество символов или дочерних nodes) для node.
 *
 * @param node - Node для измерения
 * @returns Длина node
 */
function getNodeLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.length || 0;
  }
  return node.childNodes.length;
}
