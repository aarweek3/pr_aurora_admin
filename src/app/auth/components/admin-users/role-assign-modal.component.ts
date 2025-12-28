// src/app/auth/components/admin-users/role-assign-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { RoleDto } from '../../models/role.models';
import { RoleService } from '../../services/role.service';

interface ModalData {
  user: any;
  allRoles: RoleDto[];
  userRoles: string[];
}

@Component({
  selector: 'app-role-assign-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NzCheckboxModule, NzButtonModule],
  template: `
    <div class="role-list">
      <div *ngFor="let role of allRoles" class="role-item">
        <label nz-checkbox [(ngModel)]="selectedRoles[role.name]">
          <span [style.fontWeight]="selectedRoles[role.name] ? 'bold' : 'normal'">
            {{ role.name }}
          </span>
          <span *ngIf="role.description" style="color: #999; margin-left: 8px;">
            ({{ role.description }})
          </span>
          <span style="color: #999; margin-left: 8px;">
            - {{ role.usersCount }} пользователей
          </span>
        </label>
      </div>
    </div>

    <div class="footer">
      <button nz-button (click)="cancel()">Отмена</button>
      <button nz-button nzType="primary" (click)="save()" [nzLoading]="saving">Сохранить</button>
    </div>
  `,
  styles: [
    `
      .role-list {
        padding: 16px 0;
        max-height: 400px;
        overflow-y: auto;
      }

      .role-item {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .role-item:last-child {
        border-bottom: none;
      }

      .footer {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
})
export class RoleAssignModalComponent implements OnInit {
  private modal = inject(NzModalRef);
  private modalData = inject(NZ_MODAL_DATA) as ModalData;
  private roleService = inject(RoleService);
  private message = inject(NzMessageService);

  allRoles: RoleDto[] = [];
  selectedRoles: { [key: string]: boolean } = {};
  saving = false;

  ngOnInit() {
    this.allRoles = this.modalData.allRoles;

    // Инициализируем выбранные роли
    this.allRoles.forEach((role) => {
      this.selectedRoles[role.name] = this.modalData.userRoles.includes(role.name);
    });
  }

  save() {
    const selectedRoleNames = Object.keys(this.selectedRoles).filter(
      (roleName) => this.selectedRoles[roleName],
    );

    if (selectedRoleNames.length === 0) {
      this.message.warning('Выберите хотя бы одну роль');
      return;
    }

    this.saving = true;
    this.roleService
      .assignRoles({
        userId: this.modalData.user.id,
        roleNames: selectedRoleNames,
      })
      .subscribe({
        next: () => {
          this.message.success('Роли успешно назначены');
          this.modal.close({ success: true });
        },
        error: () => {
          this.message.error('Ошибка назначения ролей');
          this.saving = false;
        },
      });
  }

  cancel() {
    this.modal.close({ success: false });
  }
}
