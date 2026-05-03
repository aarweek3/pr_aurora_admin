import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { MODAL_DATA, MODAL_REF } from '@shared/components/ui/modal/tokens/modal-tokens';
import { ModalRef } from '@shared/components/ui/modal/models/modal-ref.model';
import { ImageServiceUniversal, MediaUploadResponse, MediaFileMetadata } from '@shared/services/image-service-universal.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

export interface AvUniversalUploadModalData {
  folder?: string;
  title?: string;
  accept?: string;
}

@Component({
  selector: 'app-av-universal-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule,
    NzInputModule,
    NzAlertModule
  ],
  template: `
    <div class="modal-wrapper">
      <!-- FIXED HEADER -->
      <div class="modal-header">
        <h3 class="modal-title">{{ modalData.title || 'Универсальный загрузчик' }}</h3>
      </div>

      <!-- CONTENT AREA -->
      <div class="modal-body">
        
        <!-- STATE 1: SELECT FILE -->
        <div 
          *ngIf="!selectedFile()"
          class="drop-container" 
          [class.dragging]="isDragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input #fileInput type="file" [accept]="modalData.accept || 'image/*'" (change)="onFileSelected($event)" style="display: none" />
          <div class="drop-content">
            <div class="icon-circle">
              <span nz-icon nzType="cloud-upload" nzTheme="outline"></span>
            </div>
            <div class="drop-text">
              <strong>Выберите файл</strong> или перетащите его сюда
            </div>
            <div class="drop-hint">PNG, JPG, SVG до 10MB</div>
          </div>
        </div>

        <!-- STATE 2: PREVIEW & EDIT -->
        <div *ngIf="selectedFile()" class="editor-container">
          
          <div class="form-section">
            <label class="input-label">Желаемое имя файла:</label>
            <nz-input-group [nzSuffix]="'.' + getExtension()" class="aurora-input-group">
              <input 
                nz-input 
                [ngModel]="targetFileName()" 
                (ngModelChange)="onFileNameChange($event)"
                placeholder="имя-файла"
              />
            </nz-input-group>
          </div>

          <!-- COMPARISON BOX -->
          <div class="comparison-layout" [class.dual-view]="existingFile()">
            
            <div class="compare-card">
              <div class="card-tag">Новый файл</div>
              <div class="preview-stage">
                <img [src]="previewUrl()" alt="Local" />
              </div>
              <div class="info-footer">
                <nz-tag nzColor="blue">{{ width() }}x{{ height() }} px</nz-tag>
                <nz-tag nzColor="default">{{ sizeToKb(selectedFile()?.size) }} KB</nz-tag>
              </div>
            </div>

            <div class="compare-card conflict" *ngIf="existingFile()">
              <div class="card-tag danger">Уже на сервере ⚠️</div>
              <div class="preview-stage">
                <img [src]="existingFile()?.fullUrl" [alt]="existingFile()?.originalName" />
              </div>
              <div class="info-footer">
                <nz-tag nzColor="red">{{ existingFile()?.width }}x{{ existingFile()?.height }} px</nz-tag>
                <nz-tag nzColor="default">{{ sizeToKb(existingFile()?.fileSize) }} KB</nz-tag>
              </div>
            </div>
          </div>

          <!-- NOTIFICATIONS -->
          <div class="status-messages" *ngIf="existingFile()">
             <div class="blink-alert">
                <i nz-icon nzType="info-circle" nzTheme="fill"></i>
                Такой файл уже есть! Проверьте параметры и подтвердите перезапись.
             </div>
             <nz-alert 
                nzType="warning" 
                nzMessage="Запись в базе данных (ID) будет сохранена." 
                nzShowIcon 
                class="soft-alert">
             </nz-alert>
          </div>

          <button nz-button nzType="text" class="change-file-btn" (click)="clearSelection()" [disabled]="isUploading()">
            <i nz-icon nzType="swap"></i> Выбрать другой файл
          </button>
        </div>
      </div>

      <!-- FOOTER ACTIONS -->
      <div class="modal-footer">
        <button nz-button class="aurora-btn-secondary" (click)="cancel()" [disabled]="isUploading()">
          Отмена
        </button>
        
        <button 
          nz-button 
          class="aurora-btn-primary" 
          [class.danger]="!!existingFile()"
          (click)="upload()" 
          [disabled]="!selectedFile() || isUploading() || isChecking()"
          [nzLoading]="isUploading()"
        >
          <span nz-icon [nzType]="existingFile() ? 'warning' : 'cloud-upload'"></span>
          {{ existingFile() ? 'Перезаписать оригинал' : 'Начать загрузку' }}
        </button>
      </div>

      <!-- LOADING OVERLAY -->
      <div class="global-overlay" *ngIf="isChecking()">
        <nz-spin nzSimple nzSize="large"></nz-spin>
        <span class="overlay-text">Проверка дубликатов...</span>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blink-soft {
      0% { background: #fef2f2; border-color: #fee2e2; }
      50% { background: #fff1f2; border-color: #fecdd3; }
      100% { background: #fef2f2; border-color: #fee2e2; }
    }

    .modal-wrapper {
      display: flex; flex-direction: column; min-height: 480px; position: relative;
      background: white; border-radius: 24px;
    }

    /* HEADER */
    .modal-header {
      padding: 32px 32px 32px;
      .modal-title { margin: 0; font-weight: 800; font-size: 22px; color: #0f172a; letter-spacing: -0.02em; }
      .modal-subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    }

    /* BODY */
    .modal-body { padding: 0 32px 24px; flex: 1; }

    /* DROP ZONE */
    .drop-container {
      height: 300px; border: 2px dashed #e2e8f0; border-radius: 28px;
      background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover { border-color: #3b82f6; background: #f1f5f9; transform: scale(0.99); }
      &.dragging { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

      .drop-content {
        text-align: center;
        .icon-circle { 
          width: 80px; height: 80px; background: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          span { font-size: 32px; color: #3b82f6; }
        }
        .drop-text { font-size: 17px; color: #334155; margin-bottom: 8px; }
        .drop-hint { font-size: 13px; color: #94a3b8; }
      }
    }

    /* EDITOR AREA */
    .editor-container { display: flex; flex-direction: column; gap: 24px; }

    .form-section {
      .input-label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 14px; color: #1e293b; }
      .aurora-input-group { 
        height: 48px; border-radius: 14px; overflow: hidden;
        input { height: 48px; font-weight: 600; font-size: 15px; }
      }
    }

    /* COMPARISON */
    .comparison-layout {
      display: grid; grid-template-columns: 1fr; gap: 20px;
      &.dual-view { grid-template-columns: 1fr 1fr; }
    }

    .compare-card {
      border: 1px solid #f1f5f9; border-radius: 20px; padding: 16px; background: #fff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      .card-tag { font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      .card-tag.danger { color: #ef4444; }
      
      .preview-stage {
        height: 180px; background: #f8fafc; border-radius: 14px; overflow: hidden;
        display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
        img { max-width: 100%; max-height: 100%; object-fit: contain; }
      }
      .info-footer { display: flex; gap: 6px; }
    }

    /* STATUS MESSAGES */
    .status-messages { display: flex; flex-direction: column; gap: 12px; }
    .blink-alert {
      padding: 14px 20px; border-radius: 14px; border: 1px solid #fee2e2;
      animation: blink-soft 2s infinite ease-in-out;
      display: flex; align-items: center; gap: 10px;
      color: #ef4444; font-weight: 700; font-size: 14px;
      i { font-size: 18px; }
    }
    .soft-alert { border-radius: 14px; border: none; background: #fff7ed; padding: 10px 16px; }

    .change-file-btn { align-self: flex-start; font-weight: 700; color: #64748b; &:hover { color: #ef4444; } }

    /* FOOTER */
    .modal-footer {
      padding: 24px 32px 32px; border-top: 1px solid #f8fafc;
      display: flex; justify-content: flex-end; gap: 16px;
    }

    /* BUTTON STYLES */
    .aurora-btn-primary, .aurora-btn-secondary {
      height: 48px; padding: 0 28px; border-radius: 14px; font-weight: 700; font-size: 15px; 
      transition: all 0.2s;
    }
    .aurora-btn-primary {
      background: #3b82f6; border: none; color: white;
      &:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4); }
      &.danger { 
        background: #ef4444; 
        &:hover { background: #dc2626; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4); }
      }
    }
    .aurora-btn-secondary {
      background: #f1f5f9; border: none; color: #475569;
      &:hover { background: #e2e8f0; color: #1e293b; }
    }

    /* OVERLAY */
    .global-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); z-index: 1000;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
      border-radius: 24px;
      .overlay-text { font-weight: 800; color: #3b82f6; font-size: 16px; letter-spacing: -0.01em; }
    }
  `]
})
export class AvUniversalUploadModalComponent implements OnInit {
  // Поддержка обоих типов модалок (NzModal и наш ModalService)
  readonly modalData = inject<AvUniversalUploadModalData>(MODAL_DATA, { optional: true }) 
                    || inject<AvUniversalUploadModalData>(NZ_MODAL_DATA, { optional: true }) 
                    || {};
                    
  private modalRef = (inject(ModalRef, { optional: true }) 
                  || inject(NzModalRef, { optional: true })) as any;
                  
  private imgService = inject(ImageServiceUniversal);
  private message = inject(NzMessageService);

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  targetFileName = signal<string>('');
  existingFile = signal<MediaFileMetadata | null>(null);
  
  width = signal<number>(0);
  height = signal<number>(0);
  
  isDragging = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isChecking = signal<boolean>(false);

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.message.error('Разрешены только изображения!');
      return;
    }

    this.selectedFile.set(file);
    this.existingFile.set(null);

    const slugName = this.imgService.slugify(file.name);
    const nameWithoutExt = slugName.substring(0, slugName.lastIndexOf('.')) || slugName;
    this.targetFileName.set(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      this.previewUrl.set(res);
      const img = new Image();
      img.onload = () => {
        this.width.set(img.width);
        this.height.set(img.height);
      };
      img.src = res;
    };
    reader.readAsDataURL(file);
  }

  onFileNameChange(newName: string): void {
    const slugified = this.imgService.slugify(newName).replace(/\.[^/.]+$/, "");
    this.targetFileName.set(slugified.toLowerCase().trim());
    this.existingFile.set(null);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    if (this.existingFile()) {
      this.performActualUpload(file);
      return;
    }

    this.isChecking.set(true);
    const folder = this.modalData.folder || 'general';
    const finalName = this.getFullFileName();

    this.imgService.checkExists(finalName, folder).pipe(
      finalize(() => this.isChecking.set(false))
    ).subscribe({
      next: (res) => {
        if (res.exists) {
          this.existingFile.set(res);
        } else {
          this.performActualUpload(file);
        }
      },
      error: () => this.performActualUpload(file)
    });
  }

  private performActualUpload(file: File): void {
    this.isUploading.set(true);
    const folder = this.modalData.folder || 'general';
    const finalName = this.getFullFileName();

    this.imgService.upload(file, folder, finalName, this.width(), this.height())
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: (res) => {
          this.message.success('Успешно сохранено');
          this.modalRef.close(res);
        },
        error: (err) => this.message.error(err.message || 'Ошибка загрузки')
      });
  }

  getExtension(): string {
    const name = this.selectedFile()?.name || '';
    return name.split('.').pop()?.toLowerCase() || 'jpg';
  }

  sizeToKb(size: number | undefined): string {
    if (!size) return '0.0';
    return (size / 1024).toFixed(1);
  }

  private getFullFileName(): string {
    return `${this.targetFileName()}.${this.getExtension()}`;
  }

  clearSelection(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.existingFile.set(null);
    this.targetFileName.set('');
  }

  cancel(): void { this.modalRef.close(); }

  onDragOver(e: any): void { e.preventDefault(); this.isDragging.set(true); }
  onDragLeave(e: any): void { e.preventDefault(); this.isDragging.set(false); }
  onDrop(e: any): void {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }
}
