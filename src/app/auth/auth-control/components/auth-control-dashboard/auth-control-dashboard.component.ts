import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { PlaygroundTabComponent } from '../playground-tab/playground-tab.component';
import { RolesTabComponent } from '../roles-tab/roles-tab.component';
import { SessionTabComponent } from '../session-tab/session-tab.component';
import { SimulatorTabComponent } from '../simulator-tab/simulator-tab.component';
import { TokensTabComponent } from '../tokens-tab/tokens-tab.component';

@Component({
  selector: 'app-auth-control-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzTabsModule,
    NzIconModule,
    NzButtonModule,
    NzTagModule,
    NzToolTipModule,
    SessionTabComponent,
    TokensTabComponent,
    RolesTabComponent,
    SimulatorTabComponent,
    PlaygroundTabComponent,
    NzDrawerModule,
    NzDividerModule,
    NzTypographyModule,
  ],
  templateUrl: './auth-control-dashboard.component.html',
  styleUrls: ['./auth-control-dashboard.component.scss'],
})
export class AuthControlDashboardComponent {
  selectedIndex = signal(0);
  isHelpVisible = signal(false);

  // Tab configuration
  tabs = [
    { title: 'Сессия', icon: 'user', disabled: false },
    { title: 'Токены', icon: 'safety-certificate', disabled: false },
    { title: 'Роли', icon: 'team', disabled: false },
    { title: 'Симулятор', icon: 'warning', disabled: false },
    { title: 'Песочница', icon: 'experiment', disabled: false },
  ];

  constructor() {}

  handleTabChange(index: number): void {
    this.selectedIndex.set(index);
  }

  toggleHelp(): void {
    this.isHelpVisible.update((v) => !v);
  }
}
