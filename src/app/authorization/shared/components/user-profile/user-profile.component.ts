import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth/services/auth.service';
import { UserNamePipe } from '../../pipes/user-name.pipe';

/**
 * User Profile Component
 *
 * Отображает краткую информацию о текущем пользователе.
 */
@Component({
  selector: 'av-user-profile',
  standalone: true,
  imports: [CommonModule, UserNamePipe],
  template: `
    <div class="user-profile" *ngIf="user()">
      <span class="user-name">{{ user() | userName }}</span>
      <span class="user-role" *ngIf="roles().length">{{ roles()[0] }}</span>
    </div>
  `,
  styles: [
    `
      .user-profile {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .user-name {
        font-weight: bold;
      }
      .user-role {
        font-size: 0.8em;
        color: #888;
      }
    `,
  ],
})
export class AuthSharedUserProfileComponent {
  private authService = inject(AuthService);

  user = computed(() => this.authService.getCurrentUser());
  roles = computed(() => this.authService.getUserRoles());
}
