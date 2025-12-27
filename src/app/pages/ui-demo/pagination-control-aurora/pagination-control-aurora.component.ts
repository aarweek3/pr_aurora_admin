import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import {
  PaginationChangeEvent,
  PaginationComponent,
  PaginationShape,
  PaginationSize,
  PaginationVariant,
} from '@shared/components/ui/pagination';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { DOCUMENTATION } from './pagination-control-aurora.config';

// Interface for component configuration
interface PaginationConfig {
  total: number;
  currentPage: number;
  pageSize: number;
  variant: PaginationVariant;
  size: PaginationSize;
  shape: PaginationShape;
  color: 'primary' | 'success' | 'warning' | 'danger';
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: boolean;
  showFirstLast: boolean;
  hideOnSinglePage: boolean;
  disabled: boolean;
  locale: 'ru' | 'en';
}

@Component({
  selector: 'app-pagination-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    ControlDocumentationComponent,
    PaginationComponent,
    NzTabsModule,
    NzSelectModule,
    NzCheckboxModule,
    NzInputModule,
    NzRadioModule,
  ],
  templateUrl: './pagination-control-aurora.component.html',
  styleUrl: './pagination-control-aurora.component.scss',
})
export class PaginationControlAuroraComponent implements OnInit {
  // Helpers
  protected readonly Math = Math;

  // 1. Documentation Configuration
  readonly documentationConfig = DOCUMENTATION;

  // 2. Showcase Configuration
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Pagination Control Aurora 🔢',
      componentName: 'PaginationControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/pagination-control-aurora/pagination-control-aurora.component.ts',
      controlComponent: {
        name: 'PaginationComponent (av-pagination)',
        path: 'src/app/shared/components/ui/pagination/pagination.component.ts',
      },
      docsPath:
        'src/app/pages/ui-demo/pagination-control-aurora/pagination-control-aurora.config.ts',
      description:
        'Интерактивная демонстрация компонента пагинации с полной настройкой внешнего вида и поведения.',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [12, 12],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Текущие параметры', autoParams: true },
    },
  };

  // 3. State Management (Signals)
  config = signal<PaginationConfig>({
    total: 250,
    currentPage: 1,
    pageSize: 10,
    variant: 'default',
    size: 'medium',
    shape: 'rounded',
    color: 'primary',
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
    showFirstLast: true,
    hideOnSinglePage: false,
    disabled: false,
    locale: 'ru',
  });

  // 4. Dropdown/Radio Options
  readonly variants = [
    { value: 'default', label: 'Default' },
    { value: 'simple', label: 'Simple' },
    { value: 'compact', label: 'Compact' },
    { value: 'minimal', label: 'Minimal' },
  ];

  readonly sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  readonly shapes = [
    { value: 'square', label: 'Square' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'circle', label: 'Circle' },
  ];

  readonly colors = [
    { value: 'primary', label: 'Primary' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'danger', label: 'Danger' },
  ];

  // 5. Code Snippets for Examples (avoiding template parsing issues)
  readonly exampleSnippets = {
    basic: '<av-pagination [total]="100" [(currentPage)]="page"></av-pagination>',
    computed: `// В компоненте
displayedItems = computed(() => {
  const start = (this.page() - 1) * this.size();
  const end = start + this.size();
  return this.allItems().slice(start, end);
});`,
  };

  ngOnInit() {
    console.log('PaginationControlAuroraComponent Init');
  }

  // 6. Helper Methods
  updateConfig(key: keyof PaginationConfig, value: any) {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  onPaginationChange(event: PaginationChangeEvent) {
    // Sync current state if updated from inside component (e.g. click on page)
    this.config.update((c) => ({
      ...c,
      currentPage: event.page,
      pageSize: event.pageSize,
    }));
  }

  // 7. Code Generation
  generatedCode = computed(() => {
    const c = this.config();
    let props: string[] = [];

    props.push(`[total]="${c.total}"`);
    props.push(`[(currentPage)]="currentPage"`);
    props.push(`[(pageSize)]="pageSize"`);

    if (c.variant !== 'default') props.push(`variant="${c.variant}"`);
    if (c.size !== 'medium') props.push(`size="${c.size}"`);
    if (c.shape !== 'rounded') props.push(`shape="${c.shape}"`);
    if (c.color !== 'primary') props.push(`color="${c.color}"`);
    if (c.locale !== 'ru') props.push(`locale="${c.locale}"`);

    if (!c.showSizeChanger) props.push(`[showSizeChanger]="false"`);
    if (c.showQuickJumper) props.push(`[showQuickJumper]="true"`);
    if (!c.showTotal) props.push(`[showTotal]="false"`);
    if (!c.showFirstLast) props.push(`[showFirstLast]="false"`);
    if (c.hideOnSinglePage) props.push(`[hideOnSinglePage]="true"`);
    if (c.disabled) props.push(`[disabled]="true"`);

    const propsString = props.length > 0 ? '\n  ' + props.join('\n  ') + '\n' : '';
    const htmlCode = `<av-pagination${propsString}>\n</av-pagination>`;

    const tsCode = `// В компоненте (TypeScript)
import { signal } from '@angular/core';

currentPage = signal(${c.currentPage});
pageSize = signal(${c.pageSize});
totalItems = ${c.total};

onPaginationChange(event: PaginationChangeEvent) {
  console.log('Page:', event.page, 'Size:', event.pageSize);
}`;

    return { html: htmlCode, typescript: tsCode };
  });

  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `${code.html}\n\n${code.typescript}`;
  });

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // 8. Example Signals
  examplePage1 = signal(1);
  examplePage2 = signal(1);
  examplePage3 = signal(1);
  examplePage4 = signal(1);
  examplePage5 = signal(1);
  examplePage6 = signal(1);
  examplePage7 = signal(1);
  examplePageSize1 = signal(10);

  allItems = signal(
    Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Запись #${i + 1}` })),
  );
  clientPage = signal(1);
  clientPageSize = signal(5);

  displayedItems = computed(() => {
    const start = (this.clientPage() - 1) * this.clientPageSize();
    const end = start + this.clientPageSize();
    return this.allItems().slice(start, end);
  });
}
