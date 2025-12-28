// src/app/auth/components/admin-users/admin-users.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Subject, takeUntil } from 'rxjs';

import { LoggingService } from '@shared/infrastructure/logging/logging.service';
import { RoleDto } from '../../models/role.models';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDetailDto,
  UserFilterDto,
} from '../../models/user.models';
import { RoleService } from '../../services/role.service';
import { RoleAssignModalComponent } from './role-assign-modal.component';
import { UserApiService } from './user-api.service';
import { UserModalComponent } from './user-modal.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTagModule,
    UserModalComponent,
  ],
  template: `
    <div class="users-container">
      <div class="header">
        <h2>Управление пользователями</h2>
        <div class="actions">
          <nz-input-group [nzSuffix]="suffixIconSearch" class="search-input">
            <input
              nz-input
              placeholder="Поиск пользователей..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
            />
          </nz-input-group>
          <ng-template #suffixIconSearch>
            <span nz-icon nzType="search"></span>
          </ng-template>
          <button nz-button nzType="primary" (click)="showCreateModal()">
            <span nz-icon nzType="plus"></span>
            Добавить пользователя
          </button>
          <button nz-button nzType="default" (click)="loadUsers()">
            <span nz-icon nzType="reload"></span>
            Обновить
          </button>
        </div>
      </div>

      <nz-table
        #usersTable
        [nzData]="users"
        [nzLoading]="loading"
        [nzPageSize]="pageSize"
        [nzPageIndex]="pageNumber"
        [nzTotal]="total"
        (nzPageIndexChange)="onPageChange($event)"
        (nzPageSizeChange)="onPageSizeChange($event)"
      >
        <thead>
          <tr>
            <th>Email</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Роли</th>
            <th>Статус</th>
            <th>Дата создания</th>
            <th>Последний вход</th>
            <th nzWidth="220px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of usersTable.data">
            <td>{{ user.email }}</td>
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>
              <nz-tag *ngFor="let role of user.roles || []" [nzColor]="getRoleColor(role)">
                {{ role }}
              </nz-tag>
              <span *ngIf="!user.roles || user.roles.length === 0" style="color: #999;">
                Нет ролей
              </span>
            </td>
            <td>
              <nz-tag [nzColor]="user.isActive ? 'green' : 'default'">
                {{ user.isActive ? 'Активен' : 'Неактивен' }}
              </nz-tag>
            </td>
            <td>{{ user.createdAt | date : 'short' }}</td>
            <td>{{ user.lastLogin ? (user.lastLogin | date : 'short') : 'Никогда' }}</td>
            <td>
              <button nz-button nzType="link" nzSize="small" (click)="viewUser(user)">
                <span nz-icon nzType="eye"></span>
              </button>
              <button nz-button nzType="link" nzSize="small" (click)="manageUserRoles(user)">
                <span nz-icon nzType="team"></span>
              </button>
              <button
                *ngIf="user.isActive"
                nz-button
                nzType="link"
                nzSize="small"
                nzDanger
                (click)="deactivateUser(user)"
              >
                <span nz-icon nzType="stop"></span>
              </button>
              <button
                *ngIf="!user.isActive"
                nz-button
                nzType="link"
                nzSize="small"
                (click)="activateUser(user)"
              >
                <span nz-icon nzType="check-circle"></span>
              </button>
              <button nz-button nzType="link" nzSize="small" nzDanger (click)="deleteUser(user)">
                <span nz-icon nzType="delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <app-user-modal
        #userModal
        (userCreated)="createUser($event)"
        (userUpdated)="updateUser($event)"
        (cancelled)="onModalCancelled()"
      >
      </app-user-modal>
    </div>
  `,
  styles: [
    `
      .users-container {
        padding: 24px;
        background: #fff;
        border-radius: 8px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .header h2 {
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .search-input {
        width: 300px;
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  @ViewChild('userModal') userModal!: UserModalComponent;

  private readonly destroy$ = new Subject<void>();
  private readonly userApi = inject(UserApiService);
  private readonly roleService = inject(RoleService);
  private readonly message = inject(NzMessageService);
  private readonly logger = inject(LoggingService);
  private readonly modal = inject(NzModalService);

  users: any[] = [];
  loading = false;
  searchTerm = '';
  pageNumber = 1;
  pageSize = 10;
  total = 0;

  ngOnInit(): void {
    this.logger.info('AdminUsersComponent', 'Инициализация');
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    const filter: UserFilterDto = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      filter.searchTerm = this.searchTerm.trim();
    }

    this.userApi
      .getUsers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.logger.info('AdminUsersComponent', 'Пользователи загружены', response);
          if (response.data && (response.data as any).data) {
            this.users = (response.data as any).data;
            this.total = (response.data as any).totalCount || 0;
          } else if (Array.isArray(response.data)) {
            this.users = response.data;
            this.total = this.users.length;
          } else {
            this.users = [];
            this.total = 0;
          }
          this.loading = false;
        },
        error: (error) => {
          this.logger.error('AdminUsersComponent', 'Ошибка загрузки', error);
          this.message.error('Ошибка при загрузке пользователей');
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadUsers();
  }

  showCreateModal(): void {
    this.userModal.show('create');
  }

  viewUser(user: any): void {
    this.logger.info('AdminUsersComponent', 'Просмотр пользователя', { id: user.id });
    const userDetail: UserDetailDto = {
      ...user,
      firstName: user.fullName.split(' ')[0] || '',
      lastName: user.fullName.split(' ').slice(1).join(' ') || '',
    };
    this.userModal.show('view', userDetail);
  }

  manageUserRoles(user: any): void {
    this.roleService.getAllRoles().subscribe({
      next: (rolesResponse) => {
        const allRoles = rolesResponse.data;

        this.roleService.getUserRoles(user.id).subscribe({
          next: (userRolesResponse) => {
            const userRoles = userRolesResponse.data;
            this.showRoleModal(user, allRoles, userRoles);
          },
        });
      },
    });
  }

  private showRoleModal(user: any, allRoles: RoleDto[], userRoles: string[]): void {
    const modal = this.modal.create({
      nzTitle: `Управление ролями: ${user.fullName}`,
      nzContent: RoleAssignModalComponent,
      nzData: {
        user,
        allRoles,
        userRoles,
      },
      nzWidth: 500,
      nzFooter: null,
    });

    modal.afterClose.subscribe((result) => {
      if (result?.success) {
        this.loadUsers();
      }
    });
  }

  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      Admin: 'red',
      User: 'blue',
      Moderator: 'orange',
    };
    return colors[roleName] || 'default';
  }

  createUser(userData: CreateUserDto): void {
    this.userApi
      .createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.message.success('Пользователь создан успешно');
          this.loadUsers();
        },
        error: (error) => {
          this.logger.error('AdminUsersComponent', 'Ошибка создания', error);
          this.message.error(error.error?.message || 'Ошибка при создании пользователя');
        },
      });
  }

  updateUser(data: { id: string; data: UpdateUserDto }): void {
    this.userApi
      .updateUser(data.id, data.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Пользователь обновлен');
          this.loadUsers();
        },
        error: (error) => {
          this.logger.error('AdminUsersComponent', 'Ошибка обновления', error);
          this.message.error(error.error?.message || 'Ошибка при обновлении');
        },
      });
  }

  activateUser(user: any): void {
    this.userApi
      .activateUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Пользователь активирован');
          this.loadUsers();
        },
        error: (error) => {
          this.logger.error('AdminUsersComponent', 'Ошибка активации', error);
          this.message.error('Ошибка при активации пользователя');
        },
      });
  }

  deactivateUser(user: any): void {
    this.userApi
      .deactivateUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Пользователь деактивирован');
          this.loadUsers();
        },
        error: (error) => {
          this.logger.error('AdminUsersComponent', 'Ошибка деактивации', error);
          this.message.error('Ошибка при деактивации пользователя');
        },
      });
  }

  deleteUser(user: any): void {
    this.modal.confirm({
      nzTitle: 'Подтверждение удаления',
      nzContent: `Вы действительно хотите удалить пользователя <strong>${user.fullName}</strong> (${user.email})?<br><br>Это действие нельзя отменить!`,
      nzOkText: 'Удалить',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          this.userApi
            .deleteUser(user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.message.success('Пользователь успешно удален');
                this.loadUsers();
                resolve();
              },
              error: (error) => {
                this.logger.error('AdminUsersComponent', 'Ошибка удаления', error);
                this.message.error(error.error?.message || 'Ошибка при удалении пользователя');
                reject();
              },
            });
        });
      },
    });
  }

  onModalCancelled(): void {
    this.logger.info('AdminUsersComponent', 'Модальное окно закрыто');
  }
}
