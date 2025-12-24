import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { IconComponent } from '../icon/icon.component';
import { WrapperUiComponent, WrapperUiConfigHeader } from '../wrapper-ui/wrapper-ui.component';

/**
 * Конфигурация для av-showcase
 */
export interface ShowcaseConfig {
  /** Конфигурация header (делегируется в wrapper-ui) */
  headerConfig: WrapperUiConfigHeader;

  /** Заголовок блока "Результат" */
  resultTitle?: string; // default: '🎨 Результат'

  /** Показать секцию "Примеры" */
  showExamples?: boolean; // default: true

  /** Показать секцию "Документация" */
  showDocs?: boolean; // default: true

  /** Свернуть секцию "Примеры" по умолчанию */
  examplesCollapsed?: boolean; // default: false

  /** Свернуть секцию "Документация" по умолчанию */
  docsCollapsed?: boolean; // default: false

  /** Split колонок [left, right] из 24 (например [15, 9] = 60/40) */
  columnSplit?: [number, number]; // default: [15, 9]

  /** Фиксированный header wrapper-ui */
  headerFixed?: boolean; // default: true (sticky header включен по умолчанию)

  /** Граница между header и body wrapper-ui */
  bordered?: boolean; // default: true

  /** Настройки блоков результата */
  resultBlocks?: {
    preview?: {
      title?: string; // default: "🎨 Результат"
    };
    code?: {
      title?: string; // default: "📄 Код"
    };
    description?: {
      title?: string; // default: "📋 Описание"
      autoParams?: boolean; // default: true
    };
  };
}

@Component({
  selector: 'av-showcase',
  standalone: true,
  imports: [CommonModule, WrapperUiComponent, NzCardModule, NzGridModule, IconComponent],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent implements OnInit {
  /** Конфигурация showcase */
  config = input.required<ShowcaseConfig>();

  /** Фиксированный header wrapper-ui (прямой проброс) */
  headerFixed = input<boolean>(true);

  /** Граница между header и body (прямой проброс) */
  bordered = input<boolean>(true);

  /** Максимальная ширина контейнера (прямой проброс) */
  maxWidth = input<string>('1400px');

  /** Генерированный код от родительского компонента */
  generatedCodeInput = input<string>('');

  /** Состояние сворачивания примеров */
  examplesCollapsed = signal(false);

  /** Состояние сворачивания документации */
  docsCollapsed = signal(false);

  /** Сигнал для состояния копирования кода */
  codeCopied = signal(false);

  /** Генерированный код для копирования */
  generatedCode = computed(
    () => this.generatedCodeInput() || '// Код будет сгенерирован автоматически',
  );

  /** Заголовок блока результата */
  resultTitle = computed(() => this.config().resultTitle ?? '🎨 Результат');

  /** Показать секцию примеров */
  showExamples = computed(() => this.config().showExamples ?? true);

  /** Показать секцию документации */
  showDocs = computed(() => this.config().showDocs ?? true);

  /** Split колонок [left, right] */
  columnSplit = computed(() => this.config().columnSplit ?? [15, 9]);

  /** Заголовки блоков результата */
  previewBlockTitle = computed(() => this.config().resultBlocks?.preview?.title ?? '🎨 Результат');
  codeBlockTitle = computed(() => this.config().resultBlocks?.code?.title ?? '📄 Код');
  descriptionBlockTitle = computed(
    () => this.config().resultBlocks?.description?.title ?? '📋 Описание',
  );

  /** Автопараметры для блока описания */
  autoParams = computed(() => this.config().resultBlocks?.description?.autoParams ?? true);

  /** Проверка наличия контента для блока описания */
  hasDescriptionContent = computed(() => {
    // Здесь можно добавить логику проверки наличия showcase-description контента
    return true; // Пока всегда показываем
  });

  ngOnInit() {
    // Установка начальных состояний из конфига
    this.examplesCollapsed.set(this.config().examplesCollapsed ?? false);
    this.docsCollapsed.set(this.config().docsCollapsed ?? false);
  }

  /** Переключить сворачивание примеров */
  toggleExamples() {
    this.examplesCollapsed.update((v) => !v);
  }

  /** Переключить сворачивание документации */
  toggleDocs() {
    this.docsCollapsed.update((v) => !v);
  }

  /** Копировать код в буфер обмена */
  async copyCode() {
    const code = this.generatedCode() || '// Код будет сгенерирован автоматически';

    try {
      await navigator.clipboard.writeText(code);
      this.codeCopied.set(true);

      // Сбросить статус через 2 секунды
      setTimeout(() => {
        this.codeCopied.set(false);
      }, 2000);
    } catch (err) {
      console.error('Ошибка копирования в буфер обмена:', err);
    }
  }
}
