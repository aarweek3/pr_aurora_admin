import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { HelpCopyContainerComponent } from '@shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { ModalComponent } from '@shared/components/ui/modal';
import { AvProgressComponent } from '@shared/components/ui/progress';
import {
  ProgressSize,
  ProgressStatus,
  ProgressType,
} from '@shared/components/ui/progress/progress.types';
import { ProgressUtils } from '@shared/components/ui/progress/progress.utils';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-progress-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvProgressComponent,
    ButtonComponent,
    HelpCopyContainerComponent,
    ModalComponent,
    NzCardModule,
    NzGridModule,
    NzSliderModule,
    NzSpaceModule,
    NzSwitchModule,
    NzRadioModule,
    NzCheckboxModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzToolTipModule,
  ],
  templateUrl: './progress-ui.component.html',
  styleUrls: ['./progress-ui.component.scss'],
})
export class ProgressUiComponent {
  // Modals visibility
  showHelpModal = false;
  showPrincipleModal = false;
  showGeneratedCodeModal = false;
  generatedCode = signal('');
  isApiDocExpanded = signal(false);

  // Interactive Playground Configuration
  playgroundPercent = signal(30);
  playgroundType = signal<ProgressType>('line');
  playgroundStatus = signal<ProgressStatus>('normal');
  playgroundSize = signal<ProgressSize | number>(120);
  playgroundStrokeWidth = signal<number | undefined>(undefined);
  playgroundShowInfo = signal(true);
  playgroundIndeterminate = signal(false);
  playgroundTrailColor = signal('#f5f5f5');
  playgroundStrokeLinecap = signal<'round' | 'square' | 'butt'>('round');
  playgroundLabel = signal('Processing usage');
  playgroundGapDegree = signal(75);
  playgroundVisible = signal(true);
  playgroundStrokeColor = signal<string | undefined>(undefined);

  // Gradient playground
  useGradient = signal(false);
  gradientFrom = signal('#108ee9');
  gradientTo = signal('#87d068');

  finalStrokeColor = computed(() => {
    if (this.useGradient()) {
      return { from: this.gradientFrom(), to: this.gradientTo() };
    }
    return this.playgroundStrokeColor();
  });

  // Simulation state
  isSimulating = signal(false);
  private simulationInterval: any;

  // Example data
  percent = signal(30);
  status = signal<ProgressStatus>('normal');
  type = signal<ProgressType>('line');
  showInfo = signal(true);
  indeterminate = signal(false);

  // Helper properties
  Math = Math;

  // Code Examples
  helpCode = `// РУКОВОДСТВО ПО ИСПОЛЬЗОВАНИЮ PROGRESS BAR

// 1. БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
<av-progress [percent]="30"></av-progress>

// 2. РАЗЛИЧНЫЕ СТАТУСЫ
<av-progress [percent]="100" status="success"></av-progress>
<av-progress [percent]="70" status="exception"></av-progress>
<av-progress [percent]="50" status="active"></av-progress>

// 3. ТИПЫ ОТОБРАЖЕНИЯ
<av-progress [percent]="45" type="circle"></av-progress>
<av-progress [percent]="75" type="dashboard"></av-progress>

// 4. КАСТОМИЗАЦИЯ
<av-progress
  [percent]="60"
  [strokeWidth]="20"
  [strokeColor]="{ from: '#108ee9', to: '#87d068' }"
  size="large"
></av-progress>`;

  principleCode = `ПРИНЦИП РАБОТЫ PROGRESS BAR

1. РЕАКТИВНОСТЬ (Signals)
   - Использует Angular Signals для эффективного отслеживания изменений.
   - Computed свойства для математических расчётов SVG путей.

2. SVG РЕНДЕРИНГ
   - Для 'circle' и 'dashboard' используются динамически вычисляемые пути (path).
   - Анимация заполнения реализована через stroke-dashoffset.

3. ГИБКАЯ ТИПИЗАЦИЯ
   - Полная поддержка TypeScript интерфейсов для всех входных параметров.
   - Валидация входных данных (clamp 0-100 для percent).

4. ACCESSIBILITY
   - Семантическая роль role="progressbar".
   - Атрибуты aria-valuenow, aria-valuemin, aria-valuemax.
   - Поддержка темной темы и высокого контраста.`;

  apiInterfaceCode = `/**
 * API интерфейс компонента AvProgress
 */
interface AvProgressProps {
  /** Текущий процент прогресса (0-100) */
  percent: number;

  /** Тип отображения: линия, круг или дашборд */
  type?: 'line' | 'circle' | 'dashboard'; // default: 'line'

  /** Статус: управляет цветом и анимацией 'active' */
  status?: 'normal' | 'active' | 'success' | 'error' | 'warning';

  /** Показывать ли текстовое значение/иконку */
  showInfo?: boolean; // default: true

  /** Толщина линии прогресса в пикселях */
  strokeWidth?: number;

  /** Цвет заливки (поддерживает HEX, Градиенты {from, to} и массивы) */
  strokeColor?: string | { from: string; to: string } | string[];

  /** Форма концов линии */
  strokeLinecap?: 'round' | 'square' | 'butt'; // default: 'round'

  /** Угол разрыва для типа 'dashboard' (0-295) */
  gapDegree?: number; // default: 75

  /** Текстовая метка под или рядом с прогрессом */
  label?: string;

  /** Управление видимостью с плавной анимацией */
  visible?: boolean; // default: true

  /** Режим неопределенного прогресса (бегущая анимация) */
  indeterminate?: boolean; // default: false
}
`;

  increase(): void {
    this.playgroundPercent.update((v) => ProgressUtils.clampPercent(v + 10));
  }

  decrease(): void {
    this.playgroundPercent.update((v) => ProgressUtils.clampPercent(v - 10));
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
    this.playgroundPercent.set(0);

    this.simulationInterval = setInterval(() => {
      this.playgroundPercent.update((v) => {
        if (v >= 100) {
          this.stopSimulation();
          return 100;
        }
        return v + 1;
      });
    }, 50);
  }

  private stopSimulation(): void {
    this.isSimulating.set(false);
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  // Code Generation
  generateCode(): void {
    const p = this.playgroundPercent();
    const t = this.playgroundType();
    const s = this.playgroundStatus();
    const info = this.playgroundShowInfo();
    const ind = this.playgroundIndeterminate();
    const label = this.playgroundLabel();
    const sw = this.playgroundStrokeWidth();
    const cap = this.playgroundStrokeLinecap();
    const gap = this.playgroundGapDegree();

    let html = `<av-progress\n  [percent]="${p}"\n  type="${t}"\n  status="${s}"`;

    if (sw !== undefined) html += `\n  [strokeWidth]="${sw}"`;
    if (cap !== 'round') html += `\n  strokeLinecap="${cap}"`;
    if (info === false) html += `\n  [showInfo]="false"`;
    if (ind === true) html += `\n  [indeterminate]="true"`;
    if (this.playgroundVisible() === false) html += `\n  [visible]="false"`;

    if (this.useGradient()) {
      html += `\n  [strokeColor]="{ from: '${this.gradientFrom()}', to: '${this.gradientTo()}' }"`;
    } else if (this.playgroundStrokeColor()) {
      html += `\n  strokeColor="${this.playgroundStrokeColor()}"`;
    }

    if (label) html += `\n  label="${label}"`;
    if (t === 'dashboard' && gap !== 75) html += `\n  [gapDegree]="${gap}"`;

    html += `\n></av-progress>`;

    const ts = `// В компоненте\npercent = signal(${p});\n\n// В шаблоне\n${html}`;

    this.generatedCode.set(ts);
    this.showGeneratedCodeModal = true;
  }
}
