// src/app/auth/components/admin-roles/admin-roles.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { RoleDto } from '../../models/role.models';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzCardModule,
    NzTagModule,
    NzPopconfirmModule,
  ],
  template: `
    <nz-card nzTitle="Управление ролями" [nzExtra]="extraTemplate">
      <nz-table #rolesTable [nzData]="roles" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Пользователей</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let role of rolesTable.data">
            <td>
              <nz-tag [nzColor]="getRoleColor(role.name)">{{ role.name }}</nz-tag>
            </td>
            <td>{{ role.description || 'Нет описания' }}</td>
            <td>{{ role.usersCount }}</td>
            <td>
              <button nz-button nzType="link" nzSize="small" (click)="editRole(role)">
                Изменить
              </button>
              <button
                nz-button
                nzType="link"
                nzSize="small"
                nzDanger
                nz-popconfirm
                nzPopconfirmTitle="Удалить эту роль?"
                (nzOnConfirm)="deleteRole(role.id)"
                [disabled]="isSystemRole(role.name)"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>

    <ng-template #extraTemplate>
      <button nz-button nzType="primary" (click)="showCreateModal()">Создать роль</button>
    </ng-template>

    <!-- Модальное окно создания/редактирования -->
    <nz-modal
      [(nzVisible)]="isModalVisible"
      [nzTitle]="modalTitle"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="roleForm">
          <nz-form-item>
            <nz-form-label [nzSpan]="6">Название</nz-form-label>
            <nz-form-control [nzSpan]="18" nzErrorTip="Введите название роли">
              <input nz-input formControlName="name" placeholder="Название роли" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6">Описание</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <textarea
                nz-input
                formControlName="description"
                placeholder="Описание роли"
                [nzAutosize]="{ minRows: 3, maxRows: 6 }"
              >
              </textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 24px;
      }
    `,
  ],
})
export class AdminRolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  roles: RoleDto[] = [];
  loading = false;
  isModalVisible = false;
  modalTitle = 'Создать роль';
  editingRoleId: string | null = null;

  roleForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        this.roles = response.data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Ошибка загрузки ролей');
        this.loading = false;
      },
    });
  }

  showCreateModal() {
    this.modalTitle = 'Создать роль';
    this.editingRoleId = null;
    this.roleForm.reset();
    this.isModalVisible = true;
  }

  editRole(role: RoleDto) {
    this.modalTitle = 'Редактировать роль';
    this.editingRoleId = role.id;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
    });
    this.isModalVisible = true;
  }

  handleOk() {
    if (!this.roleForm.valid) return;

    if (this.editingRoleId) {
      // Обновление
      this.roleService.updateRole(this.editingRoleId, this.roleForm.value).subscribe({
        next: () => {
          this.message.success('Роль обновлена');
          this.isModalVisible = false;
          this.loadRoles();
        },
        error: () => this.message.error('Ошибка обновления роли'),
      });
    } else {
      // Создание
      this.roleService.createRole(this.roleForm.value).subscribe({
        next: () => {
          this.message.success('Роль создана');
          this.isModalVisible = false;
          this.loadRoles();
        },
        error: () => this.message.error('Ошибка создания роли'),
      });
    }
  }

  handleCancel() {
    this.isModalVisible = false;
  }

  deleteRole(roleId: string) {
    this.roleService.deleteRole(roleId).subscribe({
      next: () => {
        this.message.success('Роль удалена');
        this.loadRoles();
      },
      error: () => this.message.error('Ошибка удаления роли'),
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

  isSystemRole(roleName: string): boolean {
    return ['Admin', 'User'].includes(roleName);
  }
}
