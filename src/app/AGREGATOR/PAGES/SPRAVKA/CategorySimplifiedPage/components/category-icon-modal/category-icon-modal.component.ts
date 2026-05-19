import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { CategorySimplifiedStateService } from '../../services/category-simplified-state.service';

@Component({
  selector: 'app-category-icon-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzPopconfirmModule
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      nzTitle="Управление иконками категорий"
      (nzOnCancel)="modalClose.emit()"
      [nzFooter]="null"
      nzWidth="850px"
    >
      <ng-container *nzModalContent>
        <div class="icons-grid">
          @for (icon of state.customIcons(); track icon.name) {
            <nz-card nzHoverable class="icon-card">
              <div class="icon-header">
                 <button 
                   nz-button 
                   nzType="text" 
                   nzDanger 
                   nz-popconfirm
                   nzPopconfirmTitle="Удалить эту иконку?"
                   (nzOnConfirm)="state.deleteIcon(icon.name)"
                 >
                   <i nz-icon nzType="delete"></i>
                 </button>
              </div>
              <div class="icon-body" (click)="copyToClipboard(icon.name)">
                <div class="icon-preview" [innerHTML]="sanitizer.bypassSecurityTrustHtml(icon.svgCodIcon)"></div>
                <div class="icon-name">{{ icon.name }}</div>
              </div>
            </nz-card>
          }

          @if (!isAdding()) {
            <div class="add-card icon-card" (click)="isAdding.set(true)">
               <i nz-icon nzType="plus" style="font-size: 24px; color: #1890ff;"></i>
               <span style="font-weight: 600; color: #1890ff; margin-top: 8px;">Добавить иконку</span>
            </div>
          } @else {
            <nz-card class="add-form-card">
              <div class="add-form-container">
                <form nz-form [formGroup]="addForm" (ngSubmit)="handleAdd()" nzLayout="vertical" class="icon-form">
                  <nz-form-item>
                    <nz-form-control>
                      <input nz-input formControlName="name" placeholder="Имя (например, av-new)" />
                    </nz-form-control>
                  </nz-form-item>
                  <nz-form-item>
                    <nz-form-control>
                      <textarea nz-input formControlName="svgCodIcon" rows="3" placeholder="SVG код..."></textarea>
                    </nz-form-control>
                  </nz-form-item>
                  <div class="form-actions">
                    <button type="button" class="av-btn-secondary" (click)="isAdding.set(false)">Отмена</button>
                    <button type="submit" class="av-btn-hero" [disabled]="addForm.invalid">СОХРАНИТЬ</button>
                  </div>
                </form>
                
                <div class="live-preview">
                  <div class="preview-label">Предпросмотр:</div>
                  <div class="preview-box" [innerHTML]="sanitizer.bypassSecurityTrustHtml(addForm.get('svgCodIcon')?.value || '')"></div>
                </div>
              </div>
            </nz-card>
          }
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      max-height: 600px;
      overflow-y: auto;
      padding: 8px;
    }
    .icon-card {
      display: flex;
      flex-direction: column;
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #f1f5f9;
      background: #ffffff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .icon-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: #3b82f6;
    }
    .icon-header {
      display: flex;
      justify-content: flex-end;
      padding: 4px;
    }
    .icon-body {
      padding: 0 16px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .icon-preview {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      margin-bottom: 12px;
      transition: transform 0.3s;
    }
    .icon-card:hover .icon-preview {
      transform: scale(1.1);
    }
    .icon-preview ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
    .icon-name {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      word-break: break-all;
      background: #f8fafc;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .add-card {
      border: 2px dashed #e2e8f0;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 160px;
      cursor: pointer;
    }
    .add-card:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .add-form-card {
      grid-column: span 2;
      border-radius: 12px;
    }
    .add-form-container {
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: 20px;
      align-items: start;
    }
    .icon-form {
      display: flex;
      flex-direction: column;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
    .live-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .preview-label {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .preview-box {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
    }
    .preview-box ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class CategoryIconModalComponent {
  isVisible = true;
  @Output() modalClose = new EventEmitter<void>();

  state = inject(CategorySimplifiedStateService);
  sanitizer = inject(DomSanitizer);
  private message = inject(NzMessageService);
  private fb = inject(FormBuilder);

  isAdding = signal(false);
  addForm: FormGroup;

  constructor() {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      svgCodIcon: ['', Validators.required]
    });
  }

  copyToClipboard(name: string): void {
    navigator.clipboard.writeText(name);
    this.message.success(`Имя иконки "${name}" скопировано`);
  }

  handleAdd(): void {
    if (this.addForm.valid) {
      this.state.addIcon(this.addForm.value);
      this.isAdding.set(false);
      this.addForm.reset();
    }
  }
}
