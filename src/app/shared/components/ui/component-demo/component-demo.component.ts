import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HelpCopyContainerComponent } from '../container-help-copy-ui/container-help-copy-ui.component';
import { FieldGroupComponent } from '../field-group/field-group.component';
import { WrapperUiComponent } from '../wrapper-ui/wrapper-ui.component';
import { DemoConfig } from './models';
import { CodeGeneratorService } from './services/code-generator.service';

/**
 * Универсальный компонент для демонстрации UI компонентов
 * Отображает интерактивную площадку с настройками, примерами кода и документацией
 */
@Component({
  selector: 'av-component-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WrapperUiComponent,
    FieldGroupComponent,
    HelpCopyContainerComponent,
    NzTabsModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzSelectModule,
    NzSwitchModule,
    NzInputModule,
    NzInputNumberModule,
    NzCollapseModule,
  ],
  templateUrl: './component-demo.component.html',
  styleUrl: './component-demo.component.scss',
})
export class ComponentDemoComponent {
  private readonly codeGenerator = inject(CodeGeneratorService);

  // Входная конфигурация компонента
  readonly config = input.required<DemoConfig>();

  // Выходное событие при изменении значений контролов
  readonly controlValuesChange = output<Record<string, any>>();

  // Signal для хранения текущих значений всех controls
  readonly controlValues = signal<Record<string, any>>({});

  // Computed для сгенерированного HTML кода
  readonly generatedCode = computed(() => {
    return this.codeGenerator.generate(this.config().componentName, this.controlValues());
  });

  // Computed для TypeScript кода
  readonly generatedTypeScript = computed(() => {
    return this.codeGenerator.generateTypeScript(this.config().componentName, this.controlValues());
  });

  // Computed для контекста preview (для использования в parent компоненте)
  readonly previewContext = computed(() => ({
    values: this.controlValues(),
    config: this.config(),
  }));

  constructor() {
    // Эффект для инициализации дефолтных значений при загрузке config
    effect(() => {
      const defaults: Record<string, any> = {};
      this.config().controls.forEach((control) => {
        defaults[control.name] = control.defaultValue;
      });
      this.controlValues.set(defaults);
      this.controlValuesChange.emit(defaults);
    });
  }

  /**
   * Обновляет значение контрола
   */
  updateControl(name: string, value: any): void {
    this.controlValues.update((current) => {
      const newValues = { ...current, [name]: value };
      this.controlValuesChange.emit(newValues);
      return newValues;
    });
  }

  /**
   * Сбрасывает все настройки к дефолтным значениям
   */
  resetAll(): void {
    const defaults: Record<string, any> = {};
    this.config().controls.forEach((control) => {
      defaults[control.name] = control.defaultValue;
    });
    this.controlValues.set(defaults);
    this.controlValuesChange.emit(defaults);
  }
}
