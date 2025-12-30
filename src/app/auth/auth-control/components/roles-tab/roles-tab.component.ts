import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AuthService } from '../../../services/auth.service';

interface PermissionPoint {
  key: string;
  label: string;
  description: string;
}

interface RoleDefinition {
  role: string;
  permissions: string[];
  color: string;
}

@Component({
  selector: 'app-roles-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTagModule,
    NzTableModule,
    NzDividerModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzBadgeModule,
    NzToolTipModule,
    NzEmptyModule,
    NzPopoverModule,
  ],
  templateUrl: './roles-tab.component.html',
  styleUrls: ['./roles-tab.component.scss'],
})
export class RolesTabComponent {
  private authService = inject(AuthService);
  private logger = inject(LoggerConsoleService).getLogger('RolesTab');

  // Signals
  searchPermission = signal('');

  // Data: Permissions
  permissions: PermissionPoint[] = [
    {
      key: 'user:view',
      label: 'View Users',
      description: 'Ability to see the list of registered users',
    },
    {
      key: 'user:edit',
      label: 'Edit Users',
      description: 'Ability to modify user profiles and statuses',
    },
    {
      key: 'user:delete',
      label: 'Delete Users',
      description: 'Permanent removal of user accounts',
    },
    {
      key: 'role:view',
      label: 'View Roles',
      description: 'Ability to see available roles and their assignments',
    },
    {
      key: 'role:edit',
      label: 'Modify Roles',
      description: 'Ability to change permissions linked to roles',
    },
    {
      key: 'auth:control',
      label: 'Auth Control',
      description: 'Full access to internal authentication debug tools',
    },
    {
      key: 'api:debug',
      label: 'API Debug',
      description: 'Access to detailed API request/response logs',
    },
  ];

  // Data: Role Mapping (Reference)
  roleMap: RoleDefinition[] = [
    {
      role: 'Admin',
      color: 'red',
      permissions: [
        'user:view',
        'user:edit',
        'user:delete',
        'role:view',
        'role:edit',
        'auth:control',
        'api:debug',
      ],
    },
    {
      role: 'Moderator',
      color: 'blue',
      permissions: ['user:view', 'user:edit', 'role:view'],
    },
    {
      role: 'User',
      color: 'green',
      permissions: ['user:view'],
    },
  ];

  // Data: Routes to test
  guardedRoutes = [
    { path: '/auth-control', role: 'Admin', label: 'Auth Control Panel' },
    { path: '/admin/users', role: 'Moderator', label: 'User Management' },
    { path: '/admin/roles', role: 'Admin', label: 'Role Management' },
    { path: '/dashboard', role: 'User', label: 'Standard Dashboard' },
  ];

  // Computed
  currentRoles = computed(() => this.authService.getUserRoles());

  hasPermission = computed(() => {
    const roles = this.currentRoles();
    const search = this.searchPermission().toLowerCase().trim();

    if (!search) return null;

    // Check if any of our roles has this permission according to our map
    return this.roleMap.some(
      (rd) =>
        roles.includes(rd.role) &&
        rd.permissions.some((p) => p.toLowerCase().includes(search) || p === search),
    );
  });

  constructor() {}

  checkRoleAccess(requiredRole: string): boolean {
    return this.authService.hasRole(requiredRole);
  }

  getPermissionsForRole(roleName: string): string[] {
    return this.roleMap.find((r) => r.role === roleName)?.permissions || [];
  }
}
