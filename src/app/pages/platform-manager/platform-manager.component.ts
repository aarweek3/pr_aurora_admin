import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlatformListComponent } from './components/platform-list/platform-list.component';

@Component({
  selector: 'app-platform-manager',
  standalone: true,
  imports: [CommonModule, PlatformListComponent],
  template: `
    <div class="platform-manager-container">
      <app-platform-list></app-platform-list>
    </div>
  `,
  styles: [
    `
      .platform-manager-container {
        padding: 0;
      }
    `,
  ],
})
export class PlatformManagerComponent {}
