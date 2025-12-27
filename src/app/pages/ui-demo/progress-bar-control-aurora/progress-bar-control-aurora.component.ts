import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation/control-documentation.component';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { AvProgressComponent } from '@shared/components/ui/progress';
import {
  ProgressSize,
  ProgressStatus,
  ProgressType,
} from '@shared/components/ui/progress/progress.types';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { DOCUMENTATION } from './progress-bar-control-aurora.config';

interface ProgressConfig {
  percent: number;
  type: ProgressType;
  status: ProgressStatus;
  size: ProgressSize | number;
  strokeWidth: number | undefined;
  showInfo: boolean;
  indeterminate: boolean;
  trailColor: string;
  strokeLinecap: 'round' | 'square' | 'butt';
  label: string;
  gapDegree: number;
  visible: boolean;
}

@Component({
  selector: 'app-progress-bar-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzGridModule,
    NzSliderModule,
    NzSwitchModule,
    NzRadioModule,
    NzCheckboxModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    AvProgressComponent,
    ShowcaseComponent,
    ControlDocumentationComponent,
    IconComponent,
    ButtonDirective,
  ],
  templateUrl: './progress-bar-control-aurora.component.html',
  styleUrls: ['./progress-bar-control-aurora.component.scss'],
})
export class ProgressBarControlAuroraComponent {
  // --- STATE ---
  config = signal<ProgressConfig>({
    percent: 30,
    type: 'line',
    status: 'normal',
    size: 'default',
    strokeWidth: undefined,
    showInfo: true,
    indeterminate: false,
    trailColor: '#f5f5f5',
    strokeLinecap: 'round',
    label: 'Завершение задачи',
    gapDegree: 75,
    visible: true,
  });

  // Gradient state
  useGradient = signal(false);
  gradientFrom = signal('#108ee9');
  gradientTo = signal('#87d068');

  // Simulation state
  isSimulating = signal(false);
  private simulationInterval: any;

  // --- SHOWCASE CONFIG ---
  showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: '📊 Progress Bar',
      description:
        'Высокопроизводительный компонент индикации прогресса на основе Angular Signals и SVG.',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [12, 12],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Текущие параметры' },
    },
  };

  documentationConfig = DOCUMENTATION;

  // --- CONSTANTS ---
  protected readonly Math = Math;
  readonly types: { label: string; value: ProgressType }[] = [
    { label: 'Линия', value: 'line' },
    { label: 'Круг', value: 'circle' },
    { label: 'Дашборд', value: 'dashboard' },
  ];

  readonly statuses: { label: string; value: ProgressStatus }[] = [
    { label: 'Обычный', value: 'normal' },
    { label: 'Активный', value: 'active' },
    { label: 'Успех', value: 'success' },
    { label: 'Ошибка', value: 'error' },
    { label: 'Предупреждение', value: 'warning' },
  ];

  readonly sizes: { label: string; value: ProgressSize }[] = [
    { label: 'Маленький', value: 'small' },
    { label: 'Стандарт', value: 'default' },
    { label: 'Большой', value: 'large' },
  ];

  readonly linecaps: { label: string; value: 'round' | 'square' | 'butt' }[] = [
    { label: 'Round', value: 'round' },
    { label: 'Square', value: 'square' },
    { label: 'Butt', value: 'butt' },
  ];

  // --- COMPUTED ---
  finalStrokeColor = computed(() => {
    if (this.useGradient()) {
      return { from: this.gradientFrom(), to: this.gradientTo() };
    }
    return undefined;
  });

  generatedCode = computed(() => {
    const c = this.config();
    const g = this.useGradient();
    const gFrom = this.gradientFrom();
    const gTo = this.gradientTo();

    let html = `<av-progress\n  [percent]="${c.percent}"\n  type="${c.type}"\n  status="${c.status}"`;

    if (c.size !== 'default') html += `\n  size="${c.size}"`;
    if (c.strokeWidth !== undefined) html += `\n  [strokeWidth]="${c.strokeWidth}"`;
    if (c.strokeLinecap !== 'round') html += `\n  strokeLinecap="${c.strokeLinecap}"`;
    if (!c.showInfo) html += `\n  [showInfo]="false"`;
    if (c.indeterminate) html += `\n  [indeterminate]="true"`;
    if (!c.visible) html += `\n  [visible]="false"`;
    if (c.label) html += `\n  label="${c.label}"`;
    if (c.type === 'dashboard' && c.gapDegree !== 75) html += `\n  [gapDegree]="${c.gapDegree}"`;

    if (g) {
      html += `\n  [strokeColor]="{ from: '${gFrom}', to: '${gTo}' }"`;
    }

    html += `\n></av-progress>`;

    return {
      html,
      typescript: `// В компоненте\npercent = signal(${c.percent});\n\n// Пример динамической смены\nincrease() {\n  this.percent.update(v => Math.min(v + 10, 100));\n}`,
    };
  });

  codeForShowcase = computed(() => this.generatedCode().html);

  // --- METHODS ---
  updateConfig<K extends keyof ProgressConfig>(key: K, value: ProgressConfig[K]): void {
    this.config.update((prev) => ({ ...prev, [key]: value }));
  }

  toggleSimulation(): void {
    if (this.isSimulating()) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
  }

  private startSimulation(): void {
    this.isSimulating.set(true);
    this.updateConfig('percent', 0);

    this.simulationInterval = setInterval(() => {
      this.config.update((prev) => {
        if (prev.percent >= 100) {
          this.stopSimulation();
          return { ...prev, percent: 100 };
        }
        return { ...prev, percent: prev.percent + 1 };
      });
    }, 50);
  }

  private stopSimulation(): void {
    this.isSimulating.set(false);
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
