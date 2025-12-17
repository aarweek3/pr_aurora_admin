import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <h1>Welcome to Aurora Admin</h1>
      <p>This is the dashboard placeholder.</p>
    </div>
  `,
  styles: [
    `
      .welcome-container {
        padding: 24px;
        text-align: center;
      }
    `,
  ],
})
export class WelcomeComponent {}
