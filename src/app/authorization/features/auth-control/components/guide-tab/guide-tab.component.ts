import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-guide-tab',
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    NzCardModule,
    NzTabsModule,
    NzStepsModule,
    NzIconModule,
    NzDividerModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './guide-tab.component.html',
  styleUrl: './guide-tab.component.scss',
})
export class GuideTabComponent {
  // Для управления выбранным подразделом справочника
  activeGuide = signal<
    'tokens' | 'session' | 'sessions-manager' | 'roles' | 'simulator' | 'playground'
  >('session');
}
