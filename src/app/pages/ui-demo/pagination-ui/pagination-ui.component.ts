import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { ModalComponent } from '../../../shared/components/ui/modal';
import {
  PaginationChangeEvent,
  PaginationComponent,
} from '../../../shared/components/ui/pagination';

@Component({
  selector: 'app-pagination-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    ButtonDirective,
    HelpCopyContainerComponent,
    ModalComponent,
  ],
  templateUrl: './pagination-ui.component.html',
  styleUrl: './pagination-ui.component.scss',
})
export class PaginationUiComponent {
  showHelpModal = false;
  showPrincipleModal = false;
  showGeneratedCodeModal = false;
  generatedCode = signal('');

  // Demo data
  currentPage1 = signal(1);
  currentPage2 = signal(1);
  currentPage3 = signal(1);
  currentPage4 = signal(1);
  currentPage5 = signal(1);
  currentPage6 = signal(1);
  currentPage7 = signal(1);
  currentPage8 = signal(1);

  pageSize1 = signal(10);
  pageSize2 = signal(20);

  // Mock data for examples
  totalItems = 250;

  // Client-side pagination example
  allItems = signal(
    Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
    })),
  );

  clientPage = signal(1);
  clientPageSize = signal(10);

  // Interactive Playground Configuration
  playgroundPage = signal(1);
  playgroundPageSize = signal(10);
  playgroundTotal = signal(250);
  playgroundSize = signal<'small' | 'medium' | 'large'>('medium');
  playgroundVariant = signal<'default' | 'simple' | 'compact' | 'minimal'>('default');
  playgroundShowSizeChanger = signal(true);
  playgroundShowQuickJumper = signal(false);
  playgroundShowTotal = signal(true);
  playgroundLocale = signal<'ru' | 'en'>('ru');
  playgroundShape = signal<'square' | 'rounded' | 'circle'>('rounded');
  playgroundColor = signal<'primary' | 'success' | 'warning' | 'danger'>('primary');
  playgroundShowFirstLast = signal(true);
  playgroundDisabled = signal(false);

  // Expose Math for template
  Math = Math;

  // Code examples
  helpCode = `// РУКОВОДСТВО ПО ИСПОЛЬЗОВАНИЮ PAGINATION

// 1. БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
<av-pagination
  [total]="100"
  [(currentPage)]="page"
  [(pageSize)]="size">
</av-pagination>

// 2. С ОБРАБОТЧИКОМ ИЗМЕНЕНИЙ
<av-pagination
  [total]="totalItems"
  [(currentPage)]="currentPage"
  [(pageSize)]="pageSize"
  (paginationChange)="onPaginationChange($event)">
</av-pagination>

// В компоненте:
onPaginationChange(event: PaginationChangeEvent) {
  console.log('Page:', event.page);
  console.log('Page Size:', event.pageSize);
  console.log('Range:', event.range); // { start: 1, end: 10 }
  console.log('Total:', event.total);
}

// 3. SERVER-SIDE ПАГИНАЦИЯ
export class UserListComponent {
  users = signal<User[]>([]);
  total = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  constructor(private userService: UserService) {
    effect(() => {
      this.loadUsers(this.currentPage(), this.pageSize());
    });
  }

  loadUsers(page: number, size: number) {
    this.userService.getUsers({ page, size }).subscribe(response => {
      this.users.set(response.data);
      this.total.set(response.total);
    });
  }
}

// 4. CLIENT-SIDE ПАГИНАЦИЯ
export class ProductListComponent {
  allProducts = signal<Product[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);

  displayedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.allProducts().slice(start, end);
  });
}`;

  principleCode = `ПРИНЦИП РАБОТЫ КОМПОНЕНТА ПАГИНАЦИИ

1. РЕАКТИВНОСТЬ (Signals + model())
   - Использует Angular 19 model() для двусторонней привязки
   - Computed свойства для автоматического пересчета
   - Эффективное отслеживание изменений

2. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
   - totalPages: Math.ceil(total / pageSize)
   - range: { start, end } - диапазон элементов
   - visiblePages: массив видимых страниц с многоточием
   - canGoPrev/canGoNext: валидация навигации

3. ВАЛИДАЦИЯ
   - Автоматическая проверка границ страниц
   - Коррекция при изменении pageSize
   - Валидация Quick Jumper ввода

4. СОБЫТИЯ
   - paginationChange: объединенное событие с полным payload
   - pageChange: изменение страницы (обратная совместимость)
   - pageSizeChange: изменение размера (обратная совместимость)

5. ACCESSIBILITY
   - Кнопки вместо ссылок (правильная семантика)
   - ARIA атрибуты (role, aria-label, aria-current)
   - Keyboard navigation (Tab, Enter, Arrow keys)
   - Screen reader friendly

6. АДАПТИВНОСТЬ
   - Responsive layout для мобильных
   - Автоматическое переключение вариантов (опционально)
   - Гибкая настройка через inputs`;

  basicCode = `<av-pagination
  [total]="100"
  [(currentPage)]="page">
</av-pagination>`;

  variantsCode = `<!-- Default (полный) -->
<av-pagination
  [total]="250"
  [(currentPage)]="page"
  variant="default">
</av-pagination>

<!-- Simple (упрощенный) -->
<av-pagination
  [total]="250"
  [(currentPage)]="page"
  variant="simple">
</av-pagination>

<!-- Compact (компактный) -->
<av-pagination
  [total]="250"
  [(currentPage)]="page"
  variant="compact">
</av-pagination>

<!-- Minimal (минимальный) -->
<av-pagination
  [total]="250"
  [(currentPage)]="page"
  variant="minimal">
</av-pagination>`;

  sizesCode = `<av-pagination [total]="100" [(currentPage)]="page" size="small"></av-pagination>
<av-pagination [total]="100" [(currentPage)]="page" size="medium"></av-pagination>
<av-pagination [total]="100" [(currentPage)]="page" size="large"></av-pagination>`;

  sizeChangerCode = `<av-pagination
  [total]="500"
  [(currentPage)]="page"
  [(pageSize)]="size"
  [showSizeChanger]="true"
  [pageSizeOptions]="[10, 25, 50, 100]">
</av-pagination>`;

  quickJumperCode = `<av-pagination
  [total]="1000"
  [(currentPage)]="page"
  [showQuickJumper]="true">
</av-pagination>`;

  localeCode = `<!-- Русский -->
<av-pagination [total]="100" [(currentPage)]="page" locale="ru"></av-pagination>

<!-- Английский -->
<av-pagination [total]="100" [(currentPage)]="page" locale="en"></av-pagination>`;

  clientSideCode = `// В компоненте
allItems = signal(Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: \`Item \${i + 1}\`
})));

currentPage = signal(1);
pageSize = signal(10);

displayedItems = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize();
  const end = start + this.pageSize();
  return this.allItems().slice(start, end);
});

// В шаблоне
<div *ngFor="let item of displayedItems()">
  {{ item.name }}
</div>

<av-pagination
  [total]="allItems().length"
  [(currentPage)]="currentPage"
  [(pageSize)]="pageSize">
</av-pagination>`;

  // Methods
  onPaginationChange(event: PaginationChangeEvent) {
    console.log('Pagination changed:', event);
  }

  // Computed для client-side примера
  get displayedItems() {
    const start = (this.clientPage() - 1) * this.clientPageSize();
    const end = start + this.clientPageSize();
    return this.allItems().slice(start, end);
  }

  // Генерация кода настройки пагинации
  generatePaginationCode(): void {
    const config = {
      total: this.playgroundTotal(),
      pageSize: this.playgroundPageSize(),
      size: this.playgroundSize(),
      variant: this.playgroundVariant(),
      showSizeChanger: this.playgroundShowSizeChanger(),
      showQuickJumper: this.playgroundShowQuickJumper(),
      showTotal: this.playgroundShowTotal(),
      locale: this.playgroundLocale(),
      shape: this.playgroundShape(),
      color: this.playgroundColor(),
      showFirstLast: this.playgroundShowFirstLast(),
      disabled: this.playgroundDisabled(),
    };

    // Генерация HTML кода - ВСЕГДА включаем все параметры
    const htmlAttributes: string[] = [];

    // Обязательные атрибуты
    htmlAttributes.push(`[total]="totalItems"`);
    htmlAttributes.push(`[(currentPage)]="currentPage"`);
    htmlAttributes.push(`[(pageSize)]="pageSize"`);

    // Всегда добавляем все параметры для полноты
    htmlAttributes.push(`size="${config.size}"`);
    htmlAttributes.push(`variant="${config.variant}"`);
    htmlAttributes.push(`shape="${config.shape}"`);
    htmlAttributes.push(`color="${config.color}"`);
    htmlAttributes.push(`locale="${config.locale}"`);

    // Boolean параметры
    htmlAttributes.push(`[showSizeChanger]="${config.showSizeChanger}"`);
    htmlAttributes.push(`[showQuickJumper]="${config.showQuickJumper}"`);
    htmlAttributes.push(`[showTotal]="${config.showTotal}"`);
    htmlAttributes.push(`[showFirstLast]="${config.showFirstLast}"`);
    htmlAttributes.push(`[disabled]="${config.disabled}"`);

    const htmlCode = `<av-pagination\n  ${htmlAttributes.join('\n  ')}\n>\n</av-pagination>`;

    // Генерация TypeScript кода
    const tsCode = `// В компоненте (TypeScript)
import { Component, signal } from '@angular/core';
import { PaginationComponent, PaginationChangeEvent } from '@shared/components/ui/pagination';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './your-component.html',
})
export class YourComponent {
  // Состояние пагинации
  currentPage = signal(1);
  pageSize = signal(${config.pageSize});
  totalItems = ${config.total}; // Или signal(${config.total})

  // Обработчик изменения пагинации
  onPaginationChange(event: PaginationChangeEvent) {
    console.log('Страница:', event.page);
    console.log('Размер:', event.pageSize);
    console.log('Диапазон:', event.range);

    // Здесь загрузка данных с сервера
    // this.loadData(event.page, event.pageSize);
  }
}`;

    // Объединенный код
    const fullCode = `${tsCode}\n\n// В шаблоне (HTML)\n${htmlCode}`;

    this.generatedCode.set(fullCode);
    this.showGeneratedCodeModal = true;
  }
}
