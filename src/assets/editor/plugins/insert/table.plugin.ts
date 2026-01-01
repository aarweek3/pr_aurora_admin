import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Table Plugin для Aurora Editor
 *
 * Функциональность:
 * - Создание таблицы с настраиваемым количеством строк и столбцов
 * - Контекстное меню для управления таблицей (правый клик)
 * - Добавление/удаление строк и столбцов
 * - Объединение и разделение ячеек
 * - Настройка стилей (границы, чередующиеся строки, hover эффект)
 * - Header row support
 * - Responsive дизайн
 */
export class TablePlugin implements AuroraPlugin {
  name = 'table';
  title = 'Вставить таблицу';
  icon = '📊';

  private readonly TABLE_CLASS = 'aurora-table';
  private readonly TABLE_WRAPPER_CLASS = 'aurora-table-wrapper';
  private readonly HEADER_ROW_CLASS = 'aurora-table-header';
  private readonly STRIPED_CLASS = 'aurora-table-striped';
  private readonly BORDERED_CLASS = 'aurora-table-bordered';
  private readonly HOVER_CLASS = 'aurora-table-hover';
  private readonly CONTEXT_MENU_CLASS = 'aurora-table-context-menu';

  private contextMenu: HTMLElement | null = null;
  private currentTable: HTMLTableElement | null = null;
  private currentCell: HTMLTableCellElement | null = null;

  constructor() {
    this.injectStyles();
    this.setupGlobalClickListener();
  }

  execute(editorElement: HTMLElement): boolean {
    // Открываем модальное окно для настройки таблицы
    this.openTableModal(editorElement);
    return true;
  }

  isActive(editorElement: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let node = selection.anchorNode;
    while (node && node !== editorElement) {
      if (node.nodeName === 'TABLE') {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * Открывает модальное окно для создания таблицы
   */
  private openTableModal(editorElement: HTMLElement): void {
    // Используем событие для открытия модального окна через Angular компонент
    const event = new CustomEvent('openTableModal', {
      detail: {
        callback: (config: TableConfig) => {
          this.createTable(editorElement, config);
        },
      },
    });
    document.dispatchEvent(event);
  }

  /**
   * Создает таблицу с заданными параметрами
   */
  private createTable(editorElement: HTMLElement, config: TableConfig): void {
    const selection = window.getSelection();
    if (!selection) return;

    // Создаем wrapper для responsive таблицы
    const wrapper = document.createElement('div');
    wrapper.className = this.TABLE_WRAPPER_CLASS;
    wrapper.contentEditable = 'false';

    // Создаем таблицу
    const table = document.createElement('table');
    table.className = this.TABLE_CLASS;

    // Применяем стили
    if (config.bordered) {
      table.classList.add(this.BORDERED_CLASS);
    }
    if (config.striped) {
      table.classList.add(this.STRIPED_CLASS);
    }
    if (config.hover) {
      table.classList.add(this.HOVER_CLASS);
    }

    // Устанавливаем ширину
    if (config.widthType === 'full') {
      table.style.width = '100%';
    } else if (config.widthType === 'auto') {
      table.style.width = 'auto';
    } else if (config.widthType === 'custom' && config.customWidth) {
      table.style.width = config.customWidth + 'px';
    }

    // Создаем tbody
    const tbody = document.createElement('tbody');

    // Создаем строки
    for (let i = 0; i < config.rows; i++) {
      const row = document.createElement('tr');

      // Первая строка - заголовок
      if (i === 0 && config.hasHeader) {
        row.classList.add(this.HEADER_ROW_CLASS);
      }

      // Создаем ячейки
      for (let j = 0; j < config.cols; j++) {
        const cell =
          i === 0 && config.hasHeader ? document.createElement('th') : document.createElement('td');

        cell.contentEditable = 'true';
        cell.textContent = i === 0 && config.hasHeader ? `Заголовок ${j + 1}` : '';

        // Добавляем контекстное меню на правый клик
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.showContextMenu(e, table, cell);
        });

        row.appendChild(cell);
      }

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    wrapper.appendChild(table);

    // Вставляем таблицу в редактор
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrapper);

      // Перемещаем курсор после таблицы
      range.setStartAfter(wrapper);
      range.setEndAfter(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorElement.appendChild(wrapper);
    }

    // Фокусируемся на первой ячейке
    const firstCell = table.querySelector('td, th') as HTMLElement;
    if (firstCell) {
      firstCell.focus();
    }
  }

  /**
   * Показывает контекстное меню для управления таблицей
   */
  private showContextMenu(
    event: MouseEvent,
    table: HTMLTableElement,
    cell: HTMLTableCellElement,
  ): void {
    // Удаляем старое меню, если есть
    this.hideContextMenu();

    this.currentTable = table;
    this.currentCell = cell;

    // Создаем меню
    const menu = document.createElement('div');
    menu.className = this.CONTEXT_MENU_CLASS;
    menu.style.position = 'fixed';
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    menu.style.zIndex = '10000';

    // Определяем позицию ячейки
    const row = cell.parentElement as HTMLTableRowElement;
    const rowIndex = Array.from(table.rows).indexOf(row);
    const cellIndex = Array.from(row.cells).indexOf(cell);

    // Создаем пункты меню
    const menuItems = [
      { label: '➕ Вставить строку выше', action: () => this.insertRowAbove(table, rowIndex) },
      { label: '➕ Вставить строку ниже', action: () => this.insertRowBelow(table, rowIndex) },
      { label: '➕ Вставить столбец слева', action: () => this.insertColumnLeft(table, cellIndex) },
      {
        label: '➕ Вставить столбец справа',
        action: () => this.insertColumnRight(table, cellIndex),
      },
      { label: '---', action: null },
      { label: '➖ Удалить строку', action: () => this.deleteRow(table, rowIndex) },
      { label: '➖ Удалить столбец', action: () => this.deleteColumn(table, cellIndex) },
      { label: '---', action: null },
      { label: '🔗 Объединить ячейки', action: () => this.mergeCells(table, cell) },
      { label: '✂️ Разделить ячейку', action: () => this.splitCell(table, cell) },
      { label: '---', action: null },
      { label: '🗑️ Удалить таблицу', action: () => this.deleteTable(table) },
    ];

    menuItems.forEach((item) => {
      if (item.label === '---') {
        const separator = document.createElement('div');
        separator.className = 'menu-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.textContent = item.label;
        menuItem.addEventListener('click', () => {
          if (item.action) {
            item.action();
          }
          this.hideContextMenu();
        });
        menu.appendChild(menuItem);
      }
    });

    document.body.appendChild(menu);
    this.contextMenu = menu;
  }

  /**
   * Скрывает контекстное меню
   */
  private hideContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.remove();
      this.contextMenu = null;
    }
  }

  /**
   * Вставляет строку выше текущей
   */
  private insertRowAbove(table: HTMLTableElement, rowIndex: number): void {
    const row = table.rows[rowIndex];
    const newRow = document.createElement('tr');
    const cellCount = row.cells.length;

    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('td');
      cell.contentEditable = 'true';
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e, table, cell);
      });
      newRow.appendChild(cell);
    }

    row.parentElement!.insertBefore(newRow, row);
  }

  /**
   * Вставляет строку ниже текущей
   */
  private insertRowBelow(table: HTMLTableElement, rowIndex: number): void {
    const row = table.rows[rowIndex];
    const newRow = document.createElement('tr');
    const cellCount = row.cells.length;

    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('td');
      cell.contentEditable = 'true';
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e, table, cell);
      });
      newRow.appendChild(cell);
    }

    if (row.nextElementSibling) {
      row.parentElement!.insertBefore(newRow, row.nextElementSibling);
    } else {
      row.parentElement!.appendChild(newRow);
    }
  }

  /**
   * Вставляет столбец слева от текущего
   */
  private insertColumnLeft(table: HTMLTableElement, cellIndex: number): void {
    Array.from(table.rows).forEach((row) => {
      const newCell = document.createElement('td');
      newCell.contentEditable = 'true';
      newCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e, table, newCell);
      });
      row.insertBefore(newCell, row.cells[cellIndex]);
    });
  }

  /**
   * Вставляет столбец справа от текущего
   */
  private insertColumnRight(table: HTMLTableElement, cellIndex: number): void {
    Array.from(table.rows).forEach((row) => {
      const newCell = document.createElement('td');
      newCell.contentEditable = 'true';
      newCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e, table, newCell);
      });
      if (row.cells[cellIndex].nextElementSibling) {
        row.insertBefore(newCell, row.cells[cellIndex].nextElementSibling);
      } else {
        row.appendChild(newCell);
      }
    });
  }

  /**
   * Удаляет строку
   */
  private deleteRow(table: HTMLTableElement, rowIndex: number): void {
    if (table.rows.length <= 1) {
      alert('Невозможно удалить последнюю строку таблицы');
      return;
    }
    table.deleteRow(rowIndex);
  }

  /**
   * Удаляет столбец
   */
  private deleteColumn(table: HTMLTableElement, cellIndex: number): void {
    if (table.rows[0].cells.length <= 1) {
      alert('Невозможно удалить последний столбец таблицы');
      return;
    }
    Array.from(table.rows).forEach((row) => {
      row.deleteCell(cellIndex);
    });
  }

  /**
   * Объединяет выделенные ячейки (упрощенная версия)
   */
  private mergeCells(table: HTMLTableElement, cell: HTMLTableCellElement): void {
    // Упрощенная версия - объединение с соседней ячейкой справа
    const row = cell.parentElement as HTMLTableRowElement;
    const cellIndex = Array.from(row.cells).indexOf(cell);
    const nextCell = row.cells[cellIndex + 1];

    if (!nextCell) {
      alert('Нет ячейки справа для объединения');
      return;
    }

    // Увеличиваем colspan
    const currentColspan = parseInt(cell.getAttribute('colspan') || '1');
    const nextColspan = parseInt(nextCell.getAttribute('colspan') || '1');
    cell.setAttribute('colspan', (currentColspan + nextColspan).toString());

    // Переносим содержимое
    if (nextCell.textContent && nextCell.textContent.trim()) {
      cell.textContent += ' ' + nextCell.textContent;
    }

    // Удаляем следующую ячейку
    nextCell.remove();
  }

  /**
   * Разделяет ячейку (упрощенная версия)
   */
  private splitCell(table: HTMLTableElement, cell: HTMLTableCellElement): void {
    const colspan = parseInt(cell.getAttribute('colspan') || '1');

    if (colspan <= 1) {
      alert('Эта ячейка не объединена');
      return;
    }

    // Уменьшаем colspan
    cell.setAttribute('colspan', (colspan - 1).toString());

    // Создаем новую ячейку
    const newCell = document.createElement('td');
    newCell.contentEditable = 'true';
    newCell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, table, newCell);
    });

    // Вставляем новую ячейку
    if (cell.nextElementSibling) {
      cell.parentElement!.insertBefore(newCell, cell.nextElementSibling);
    } else {
      cell.parentElement!.appendChild(newCell);
    }

    // Если colspan стал 1, удаляем атрибут
    if (colspan - 1 === 1) {
      cell.removeAttribute('colspan');
    }
  }

  /**
   * Удаляет всю таблицу
   */
  private deleteTable(table: HTMLTableElement): void {
    if (confirm('Вы уверены, что хотите удалить таблицу?')) {
      const wrapper = table.closest(`.${this.TABLE_WRAPPER_CLASS}`);
      if (wrapper) {
        wrapper.remove();
      } else {
        table.remove();
      }
    }
  }

  /**
   * Настройка глобального слушателя для закрытия контекстного меню
   */
  private setupGlobalClickListener(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${this.CONTEXT_MENU_CLASS}`)) {
        this.hideContextMenu();
      }
    });
  }

  /**
   * Встраивает CSS стили для таблиц
   */
  private injectStyles(): void {
    const styleId = 'aurora-table-plugin-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Wrapper для responsive таблицы */
      .${this.TABLE_WRAPPER_CLASS} {
        overflow-x: auto;
        margin: 20px 0;
        border-radius: 8px;
      }

      /* Базовые стили таблицы */
      .${this.TABLE_CLASS} {
        border-collapse: collapse;
        background: white;
        font-size: 14px;
        min-width: 300px;
      }

      /* Ячейки */
      .${this.TABLE_CLASS} td,
      .${this.TABLE_CLASS} th {
        padding: 12px 16px;
        text-align: left;
        vertical-align: middle;
        min-width: 100px;
        outline: none;
      }

      /* Заголовки */
      .${this.TABLE_CLASS} th,
      .${this.TABLE_CLASS} .${this.HEADER_ROW_CLASS} td {
        background: #f8f9fa;
        font-weight: 600;
        color: #495057;
      }

      /* Границы */
      .${this.TABLE_CLASS}.${this.BORDERED_CLASS} td,
      .${this.TABLE_CLASS}.${this.BORDERED_CLASS} th {
        border: 1px solid #dee2e6;
      }

      /* Чередующиеся строки */
      .${this.TABLE_CLASS}.${this.STRIPED_CLASS} tbody tr:nth-child(even) {
        background: #f8f9fa;
      }

      /* Hover эффект */
      .${this.TABLE_CLASS}.${this.HOVER_CLASS} tbody tr:hover {
        background: #e9ecef;
        cursor: pointer;
      }

      /* Контекстное меню */
      .${this.CONTEXT_MENU_CLASS} {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px 0;
        min-width: 220px;
        font-size: 14px;
      }

      .${this.CONTEXT_MENU_CLASS} .menu-item {
        padding: 10px 16px;
        cursor: pointer;
        transition: background 0.2s;
        color: #212529;
      }

      .${this.CONTEXT_MENU_CLASS} .menu-item:hover {
        background: #f8f9fa;
      }

      .${this.CONTEXT_MENU_CLASS} .menu-separator {
        height: 1px;
        background: #dee2e6;
        margin: 8px 0;
      }

      /* Выделенная ячейка */
      .${this.TABLE_CLASS} td:focus,
      .${this.TABLE_CLASS} th:focus {
        background: #e7f3ff;
        outline: 2px solid #0d6efd;
        outline-offset: -2px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .${this.TABLE_CLASS} td,
        .${this.TABLE_CLASS} th {
          padding: 8px 12px;
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Интерфейс конфигурации таблицы
 */
export interface TableConfig {
  rows: number;
  cols: number;
  hasHeader: boolean;
  bordered: boolean;
  striped: boolean;
  hover: boolean;
  widthType: 'full' | 'auto' | 'custom';
  customWidth?: number;
}
