import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { SearchInputComponent } from '@shared/components/ui/search';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { SEARCH_CONTROL_DOCUMENTATION } from './search-control-aurora.config';

@Component({
  selector: 'app-search-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    ControlDocumentationComponent,
    SearchInputComponent,
    NzTabsModule,
    NzTableModule,
    NzGridModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzSelectModule,
    NzCheckboxModule,
  ],
  templateUrl: './search-control-aurora.component.html',
  styleUrl: './search-control-aurora.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchControlAuroraComponent implements OnInit {
  // Конфигурация документации
  readonly documentationConfig = SEARCH_CONTROL_DOCUMENTATION;

  ngOnInit() {
    console.log('SearchControlAuroraComponent Init');
    console.log('Documentation Config:', this.documentationConfig);
    console.log('Usage Examples:', this.documentationConfig?.usageExamples);
    console.log('Usage Examples Length:', this.documentationConfig?.usageExamples?.length);
  }

  // Конфигурация Showcase
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Search Input Control 🔍',
      componentName: 'SearchControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/search-control-aurora/search-control-aurora.component.ts',
      controlComponent: {
        name: 'SearchInputComponent',
        path: 'src/app/shared/components/ui/search/search.component.ts',
      },
      docsPath: 'src/app/pages/ui-demo/search-control-aurora/search-control-aurora.config.ts',
      description:
        'Интерактивная демонстрация компонента поиска с возможностью настройки параметров в реальном времени.',
    },
    showExamples: true,
    showDocs: true,
    resultBlocks: {
      preview: { title: '🎯 Живое превью' },
      code: { title: '💻 Сгенерированный код' },
      description: { title: '⚙️ Текущие настройки', autoParams: true },
    },
  };

  // Состояние компонента (Signals)
  searchValue = signal<string>('');
  placeholder = signal<string>('Поиск по системе...');
  buttonText = signal<string>('Найти');
  size = signal<'small' | 'default' | 'large' | 'x-large'>('default');
  variant = signal<'outlined' | 'filled' | 'borderless'>('outlined');
  dashed = signal<boolean>(false);
  shape = signal<'default' | 'rounded' | 'rounded-big'>('default');
  status = signal<'default' | 'error' | 'warning' | 'success'>('default');

  // Custom dimensions
  width = signal<string | number | null>(null);
  height = signal<string | number | null>(null);
  radius = signal<string | number | null>(null);

  debounceTime = signal<number>(300);

  // Лог событий
  lastSearchEvent = signal<string | null>(null);

  // Обработчик поиска
  handleSearch(query: string): void {
    console.log('Search triggered:', query);
    this.lastSearchEvent.set(query);

    // Сброс сообщения через 3 секунды
    setTimeout(() => {
      if (this.lastSearchEvent() === query) {
        this.lastSearchEvent.set(null);
      }
    }, 3000);
  }

  // --- Signals for Usage Examples ---
  exampleBasicValue = signal('');
  exampleFilledValue = signal('');
  exampleBorderlessValue = signal('');
  exampleErrorValue = signal('');
  exampleSuccessValue = signal('');
  exampleCustomValue = signal('');
  exampleDebounceValue = signal('');

  onExampleSearch(query: string, exampleName: string) {
    console.log(`[${exampleName}] Search:`, query);
  }

  // Генерация кода для Showcase
  generatedCode = computed(() => {
    const attributes: string[] = [];

    // Value binding
    attributes.push(`[(value)]="searchQuery"`);

    // Props
    if (this.placeholder() !== 'Поиск...') {
      attributes.push(`avPlaceholder="${this.placeholder()}"`);
    }
    if (this.buttonText() !== 'Найти') {
      attributes.push(`avButtonText="${this.buttonText()}"`);
    }
    if (this.size() !== 'default') {
      attributes.push(`avSize="${this.size()}"`);
    }
    if (this.variant() !== 'outlined') {
      attributes.push(`avVariant="${this.variant()}"`);
    }
    if (this.shape() !== 'default') {
      attributes.push(`avShape="${this.shape()}"`);
    }
    if (this.status() !== 'default') {
      attributes.push(`avStatus="${this.status()}"`);
    }
    if (this.dashed()) {
      attributes.push(`[avDashed]="true"`);
    }
    // Custom dimensions
    if (this.width()) attributes.push(`[avWidth]="${this.width()}"`);
    if (this.height()) attributes.push(`[avHeight]="${this.height()}"`);
    if (this.radius()) attributes.push(`[avRadius]="${this.radius()}"`);

    if (this.debounceTime() !== 300) {
      attributes.push(`[avDebounceTime]="${this.debounceTime()}"`);
    }

    // Events
    attributes.push(`(onSearch)="handleSearch($event)"`);

    const html = `<av-search\n  ${attributes.join('\n  ')}>\n</av-search>`;

    const typescript = `// Component Logic
searchQuery = signal('${this.searchValue()}');

handleSearch(query: string) {
  console.log('Searching for:', query);
  // API call logic...
}`;

    return `${html}\n\n${typescript}`;
  });
}
