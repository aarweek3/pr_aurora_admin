import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { SessionTabComponent } from '../session-tab/session-tab.component';
import { TokensTabComponent } from '../tokens-tab/tokens-tab.component';
// import { RolesTabComponent } from '../roles-tab/roles-tab.component';
// import { SimulatorTabComponent } from '../simulator-tab/simulator-tab.component';
// import { PlaygroundTabComponent } from '../playground-tab/playground-tab.component';

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
    // RolesTabComponent,
    // SimulatorTabComponent,
    // PlaygroundTabComponent
  ],
  templateUrl: './auth-control-dashboard.component.html',
  styleUrls: ['./auth-control-dashboard.component.scss'],
})
export class AuthControlDashboardComponent {
  selectedIndex = signal(0);

  // Tab configuration
  tabs = [
    { title: 'Session', icon: 'user', disabled: false },
    { title: 'Tokens', icon: 'safety-certificate', disabled: false },
    { title: 'Roles', icon: 'team', disabled: false }, // Enabled for now
    { title: 'Simulator', icon: 'warning', disabled: false },
    { title: 'Playground', icon: 'experiment', disabled: false },
  ];

  constructor() {}

  handleTabChange(index: number): void {
    this.selectedIndex.set(index);
  }
}
