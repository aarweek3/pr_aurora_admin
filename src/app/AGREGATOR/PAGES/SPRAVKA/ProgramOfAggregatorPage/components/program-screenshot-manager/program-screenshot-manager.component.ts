import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  inject, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  OnInit, 
  OnChanges, 
  SimpleChanges 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AppLanguage } from '@language-app/models/appLanguage.model';
import { ScreenshotOfAggregator, ScreenshotOfAggregatorSync } from '../../models/screenshot-of-aggregator.model';
import { ProgramScreenshotApiService } from '../../services/program-screenshot-api.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { processInBatches } from '@shared/utils/upload-queue.util';

@Component({
  selector: 'app-program-screenshot-manager',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzTabsModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzModalModule,
    NzToolTipModule,
    NzInputModule
  ],
  template: `
    <div class="screenshot-manager-card">
      <div class="section-header">
        <h4 class="premium-section-title">Скриншоты программы</h4>
        <span class="premium-section-subtitle">Загрузка и управление промо-скриншотами карточки программы</span>
      </div>

      <!-- Drag & Drop Zone -->
      <div 
        class="upload-dropzone" 
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input 
          #fileInput 
          type="file" 
          multiple 
          accept="image/*" 
          style="display: none;" 
          (change)="onFileSelected($event)"
        />
        <div class="dropzone-content">
          <i nz-icon nzType="cloud-upload" class="upload-icon"></i>
          <span class="upload-title">Перетащите скриншоты сюда или кликните для выбора</span>
          <span class="upload-hint">Поддерживаются WebP, PNG, JPG. Соотношение сторон: 16:9, 16:10, 4:3, 5:4, 21:9</span>
        </div>
      </div>

      <!-- Languages Tabset -->
      @if (languages && languages.length > 0) {
        <nz-tabset 
          [(nzSelectedIndex)]="selectedLangIndex" 
          [nzAnimated]="false"
          class="premium-tabs"
          style="margin-top: 24px;"
        >
          @for (lang of languages; track lang.id; let i = $index) {
            <nz-tab [nzTitle]="tabTitleTpl">
              <ng-template #tabTitleTpl>
                <span class="tab-title-badge-wrapper">
                  <i nz-icon nzType="global" class="tab-icon"></i>
                  {{ lang.nativeTitle || lang.code }}
                  @if (getScreenshotsCount(lang.id) > 0) {
                    <span class="count-badge">{{ getScreenshotsCount(lang.id) }}</span>
                  }
                </span>
              </ng-template>

              <ng-template nz-tab>
                <div class="tab-content-container">
                  @if (getDisplayScreenshots(lang.id).length > 0) {
                    <div class="screenshots-grid">
                      @for (item of getDisplayScreenshots(lang.id); track item.id || item.filePath || item.fileName || idx; let idx = $index) {
                        <div class="screenshot-card" [class.is-loading]="item.loading">
                          
                          <!-- Loading Skeleton -->
                          @if (item.loading) {
                            <div class="card-loader">
                              <nz-spin nzSimple></nz-spin>
                              <span class="loader-text">Загрузка...</span>
                              <span class="file-name-hint">{{ item.fileName }}</span>
                            </div>
                          } @else {
                            <!-- Screenshot Image Preview -->
                            <div class="image-wrapper" (click)="openLightbox(item)">
                              <img 
                                [src]="getThumbnailUrl(item.filePath)" 
                                [alt]="getAltText(item, lang.id) || 'Скриншот'" 
                                class="preview-img"
                                (error)="handleImageError($event)"
                              />
                              <div class="image-overlay">
                                <i nz-icon nzType="zoom-in" class="overlay-icon"></i>
                              </div>
                            </div>

                            <!-- Card Details & Actions -->
                            <div class="card-footer">
                              <div class="info-row">
                                <span class="order-number">#{{ idx + 1 }}</span>
                                <button 
                                  nz-button 
                                  nzType="text" 
                                  nzSize="small" 
                                  class="edit-info-btn"
                                  [class.active]="editingItemUuid === getCardUuid(item)"
                                  (click)="toggleEditInfo(item)"
                                  nz-tooltip
                                  nzTooltipTitle="Редактировать описание"
                                >
                                  <i nz-icon nzType="edit"></i>
                                </button>
                              </div>

                              <!-- Localization Edit Panel -->
                              @if (editingItemUuid === getCardUuid(item)) {
                                <div class="edit-info-panel">
                                  <input 
                                    nz-input 
                                    nzSize="small"
                                    placeholder="Описание скриншота (до 255 символов)..."
                                    [value]="getTitle(item, lang.id)"
                                    (change)="onTitleChange($event, item, lang.id)"
                                    style="margin-bottom: 8px;"
                                    maxlength="255"
                                  />
                                  <textarea 
                                    nz-input 
                                    nzSize="small"
                                    placeholder="Альтернативный текст (Alt) для SEO..."
                                    [value]="getAltText(item, lang.id)"
                                    (change)="onAltTextChange($event, item, lang.id)"
                                    style="margin-bottom: 8px; resize: none; font-size: 11px;"
                                    rows="2"
                                    maxlength="1000"
                                  ></textarea>
                                </div>
                              } @else {
                                <span class="loc-text" [nzTooltipTitle]="getTitle(item, lang.id) || 'Без описания'" nz-tooltip>
                                  {{ getTitle(item, lang.id) || 'Без описания' }}
                                </span>
                              }

                              <!-- Reordering Actions -->
                              <div class="action-buttons">
                                <button 
                                  nz-button 
                                  nzType="text" 
                                  nzSize="small" 
                                  [disabled]="idx === 0"
                                  (click)="moveUp(item, lang.id)"
                                  nz-tooltip
                                  nzTooltipTitle="Переместить влево"
                                >
                                  <i nz-icon nzType="arrow-left"></i>
                                </button>
                                <button 
                                  nz-button 
                                  nzType="text" 
                                  nzSize="small" 
                                  [disabled]="idx === getScreenshotsCount(lang.id) - 1"
                                  (click)="moveDown(item, lang.id)"
                                  nz-tooltip
                                  nzTooltipTitle="Переместить вправо"
                                >
                                  <i nz-icon nzType="arrow-right"></i>
                                </button>
                                <button 
                                  nz-button 
                                  nzType="text" 
                                  nzDanger 
                                  nzSize="small"
                                  nz-popconfirm
                                  nzPopconfirmTitle="Удалить этот скриншот?"
                                  (nzOnConfirm)="deleteScreenshot(item)"
                                  nz-tooltip
                                  nzTooltipTitle="Удалить"
                                >
                                  <i nz-icon nzType="delete"></i>
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <nz-empty nzNotFoundContent="Скриншоты для этого языка еще не добавлены. Загрузите файлы перетаскиванием или выберите их в зоне выше."></nz-empty>
                  }
                </div>
              </ng-template>
            </nz-tab>
          }
        </nz-tabset>
      } @else {
        <nz-empty nzNotFoundContent="Нет доступных языков для отображения"></nz-empty>
      }
    </div>
  `,
  styles: [`
    .screenshot-manager-card {
      background: #ffffff;
      border: 1px solid #f0f0f0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .section-header {
      margin-bottom: 20px;
    }
    .premium-section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f1f1f;
      margin: 0;
    }
    .premium-section-subtitle {
      font-size: 0.85rem;
      color: #8c8c8c;
      display: block;
      margin-top: 4px;
    }
    .upload-dropzone {
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      padding: 32px 20px;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .upload-dropzone:hover, .upload-dropzone.drag-over {
      border-color: #1890ff;
      background: #e6f7ff;
    }
    .upload-dropzone.drag-over {
      transform: scale(0.995);
    }
    .dropzone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .upload-icon {
      font-size: 40px;
      color: #1890ff;
      margin-bottom: 12px;
      transition: transform 0.3s ease;
    }
    .upload-dropzone:hover .upload-icon {
      transform: translateY(-4px);
    }
    .upload-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #262626;
      margin-bottom: 4px;
    }
    .upload-hint {
      font-size: 0.8rem;
      color: #8c8c8c;
    }
    .tab-title-badge-wrapper {
      display: inline-flex;
      align-items: center;
      position: relative;
    }
    .tab-icon {
      margin-right: 6px;
    }
    .count-badge {
      background: rgba(24, 144, 255, 0.1);
      color: #1890ff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      margin-left: 6px;
    }
    .tab-content-container {
      padding: 16px 0;
    }
    .screenshots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .screenshot-card {
      background: #ffffff;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.015);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      position: relative;
      min-height: 220px;
    }
    .screenshot-card:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    .screenshot-card.is-loading {
      border-color: #e8e8e8;
      background: #fafafa;
    }
    .card-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 220px;
      padding: 20px;
      text-align: center;
    }
    .loader-text {
      margin-top: 12px;
      font-weight: 600;
      font-size: 0.85rem;
      color: #595959;
    }
    .file-name-hint {
      margin-top: 4px;
      font-size: 0.75rem;
      color: #8c8c8c;
      word-break: break-all;
    }
    .image-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 ratio */
      cursor: pointer;
      background: #fafafa;
      overflow: hidden;
    }
    .preview-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .image-wrapper:hover .preview-img {
      transform: scale(1.05);
    }
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .image-wrapper:hover .image-overlay {
      opacity: 1;
    }
    .overlay-icon {
      font-size: 24px;
      color: #ffffff;
    }
    .card-footer {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .order-number {
      font-family: monospace;
      font-weight: 700;
      color: #8c8c8c;
      font-size: 0.85rem;
    }
    .edit-info-btn {
      color: #8c8c8c;
    }
    .edit-info-btn:hover, .edit-info-btn.active {
      color: #1890ff;
    }
    .edit-info-panel {
      margin-bottom: 8px;
    }
    .loc-text {
      font-size: 0.82rem;
      font-weight: 500;
      color: #434343;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      margin-bottom: 10px;
    }
    .action-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f0f0f0;
      padding-top: 8px;
      margin-top: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramScreenshotManagerComponent implements OnInit, OnChanges {
  @Input({ required: true }) programSlug!: string;
  @Input() screenshots: ScreenshotOfAggregator[] = [];
  @Input() languages: AppLanguage[] = [];
  @Output() onScreenshotsChange = new EventEmitter<ScreenshotOfAggregator[]>();

  private api = inject(ProgramScreenshotApiService);
  private imageService = inject(ImageServiceUniversal);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private cdr = inject(ChangeDetectorRef);

  localScreenshots: ScreenshotOfAggregator[] = [];
  uploadingFiles: { name: string; languageId: number | null }[] = [];
  selectedLangIndex = 0;
  isDragOver = false;
  editingItemUuid: string | null = null;

  // Temp Guid to hold temporary uploads until saved
  private tempGuid: string;

  constructor() {
    this.tempGuid = this.generateGuid();
  }

  ngOnInit(): void {
    this.syncLocalCopy();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['screenshots']) {
      this.syncLocalCopy();
    }
  }

  private syncLocalCopy(): void {
    this.localScreenshots = this.screenshots ? JSON.parse(JSON.stringify(this.screenshots)) : [];
    this.cdr.markForCheck();
  }

  // Get active language ID from tabs selection
  getActiveLanguageId(): number | null {
    if (this.languages && this.languages.length > this.selectedLangIndex) {
      return this.languages[this.selectedLangIndex].id;
    }
    return null;
  }

  getScreenshotsCount(langId: number): number {
    return this.localScreenshots.filter(s => s.languageOfAggregatorId === langId).length;
  }

  getDisplayScreenshots(langId: number): any[] {
    const screenshots = this.localScreenshots.filter(s => s.languageOfAggregatorId === langId);
    
    const placeholders = this.uploadingFiles
      .filter(f => f.languageId === langId)
      .map(f => ({
        id: 0,
        isPlaceholder: true,
        filePath: '',
        sortOrder: 999,
        languageOfAggregatorId: langId,
        loading: true,
        fileName: f.name
      }));

    return [...screenshots, ...placeholders];
  }

  getTitle(item: ScreenshotOfAggregator, langId: number): string {
    const loc = item.localizations?.find(l => l.languageOfAggregatorId === langId);
    return loc?.title || '';
  }

  getAltText(item: ScreenshotOfAggregator, langId: number): string {
    const loc = item.localizations?.find(l => l.languageOfAggregatorId === langId);
    return loc?.altText || '';
  }

  getCardUuid(item: ScreenshotOfAggregator): string {
    return `${item.id}_${item.filePath}`;
  }

  toggleEditInfo(item: ScreenshotOfAggregator): void {
    const uuid = this.getCardUuid(item);
    this.editingItemUuid = this.editingItemUuid === uuid ? null : uuid;
    this.cdr.markForCheck();
  }

  private ensureLocalization(item: ScreenshotOfAggregator, langId: number): any {
    if (!item.localizations) {
      item.localizations = [];
    }
    let loc = item.localizations.find(l => l.languageOfAggregatorId === langId);
    if (!loc) {
      loc = { 
        languageOfAggregatorId: langId, 
        languageCode: this.languages.find(l => l.id === langId)?.code || ''
      };
      item.localizations.push(loc);
    }
    return loc;
  }

  onTitleChange(event: any, item: ScreenshotOfAggregator, langId: number): void {
    const value = event.target.value;
    const loc = this.ensureLocalization(item, langId);
    loc.title = value;

    this.emitUpdatedList();
    this.cdr.markForCheck();
  }

  onAltTextChange(event: any, item: ScreenshotOfAggregator, langId: number): void {
    const value = event.target.value;
    const loc = this.ensureLocalization(item, langId);
    loc.altText = value;

    this.emitUpdatedList();
    this.cdr.markForCheck();
  }

  getThumbnailUrl(filePath: string): string {
    if (!filePath) return '';
    const parts = filePath.split('/');
    if (parts.length < 2) return this.imageService.getAssetUrl(filePath);
    const fileName = parts.pop();
    const relativePath = `${parts.join('/')}/thumbnails/${fileName}`;
    return this.imageService.getAssetUrl(relativePath);
  }

  handleImageError(event: any): void {
    this.imageService.handleError(event);
  }

  // drag events
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
    this.cdr.markForCheck();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    this.cdr.markForCheck();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadFiles(Array.from(event.dataTransfer.files));
    }
    this.cdr.markForCheck();
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadFiles(Array.from(event.target.files));
    }
  }

  // upload pipeline
  private async uploadFiles(files: File[]): Promise<void> {
    const activeLangId = this.getActiveLanguageId();
    if (activeLangId === null) {
      this.message.error('Пожалуйста, выберите языковую вкладку перед загрузкой!');
      return;
    }

    // Add files to local loading status
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      this.message.error('Поддерживаются только графические файлы картинок!');
      return;
    }

    imageFiles.forEach(file => {
      this.uploadingFiles.push({ name: file.name, languageId: activeLangId });
    });
    this.cdr.markForCheck();

    // Use high-performance chunked concurrent batching (concurrency = 3)
    try {
      const results = await processInBatches(
        imageFiles,
        3,
        async (file) => {
          // Use programSlug if available, otherwise fallback to tempGuid
          const slugParam = this.programSlug || undefined;
          const guidParam = this.programSlug ? undefined : this.tempGuid;

          return this.api.uploadScreenshot(file, guidParam, slugParam).toPromise();
        }
      );

      // Clean loading list
      this.uploadingFiles = this.uploadingFiles.filter(
        f => !imageFiles.some(img => img.name === f.name && f.languageId === activeLangId)
      );

      // Extract results and insert new screenshots
      results.forEach(res => {
        if (res.status === 'fulfilled' && res.value) {
          const data = res.value;
          
          const maxSortOrder = this.localScreenshots
            .filter(s => s.languageOfAggregatorId === activeLangId)
            .reduce((max, s) => s.sortOrder > max ? s.sortOrder : max, 0);

          const newScreenshot: ScreenshotOfAggregator = {
            id: 0,
            filePath: data.relativePath,
            sortOrder: maxSortOrder + 1,
            languageOfAggregatorId: activeLangId,
            tempGuid: this.programSlug ? null : this.tempGuid,
            localizations: []
          };

          this.localScreenshots.push(newScreenshot);
        } else if (res.status === 'rejected') {
          console.error('[UploadQueue] File upload rejected:', res.reason);
          this.message.error(`Не удалось загрузить один из файлов: ${res.reason?.message || 'Ошибка валидации пропорций'}`);
        }
      });

      this.emitUpdatedList();
      this.cdr.markForCheck();
    } catch (err) {
      console.error('[UploadQueue] Critical batch upload failure:', err);
      this.message.error('Произошла непредвиденная ошибка при загрузке файлов.');
    }
  }

  // item actions
  deleteScreenshot(item: ScreenshotOfAggregator): void {
    this.localScreenshots = this.localScreenshots.filter(s => s !== item);
    this.emitUpdatedList();
    this.cdr.markForCheck();
  }

  // order reordering
  isFirst(item: ScreenshotOfAggregator, langId: number): boolean {
    const list = this.localScreenshots.filter(s => s.languageOfAggregatorId === langId);
    return list.indexOf(item) === 0;
  }

  isLast(item: ScreenshotOfAggregator, langId: number): boolean {
    const list = this.localScreenshots.filter(s => s.languageOfAggregatorId === langId);
    return list.indexOf(item) === list.length - 1;
  }

  moveUp(item: ScreenshotOfAggregator, langId: number): void {
    const list = this.localScreenshots.filter(s => s.languageOfAggregatorId === langId);
    const idx = list.indexOf(item);
    if (idx > 0) {
      const prevItem = list[idx - 1];
      
      // Swap SortOrder values
      const temp = item.sortOrder;
      item.sortOrder = prevItem.sortOrder;
      prevItem.sortOrder = temp;

      this.sortLocalList();
      this.emitUpdatedList();
      this.cdr.markForCheck();
    }
  }

  moveDown(item: ScreenshotOfAggregator, langId: number): void {
    const list = this.localScreenshots.filter(s => s.languageOfAggregatorId === langId);
    const idx = list.indexOf(item);
    if (idx < list.length - 1) {
      const nextItem = list[idx + 1];

      // Swap SortOrder values
      const temp = item.sortOrder;
      item.sortOrder = nextItem.sortOrder;
      nextItem.sortOrder = temp;

      this.sortLocalList();
      this.emitUpdatedList();
      this.cdr.markForCheck();
    }
  }

  private sortLocalList(): void {
    // Sort local array globally by lang and order
    this.localScreenshots.sort((a, b) => {
      if (a.languageOfAggregatorId !== b.languageOfAggregatorId) {
        return (a.languageOfAggregatorId || 0) - (b.languageOfAggregatorId || 0);
      }
      return a.sortOrder - b.sortOrder;
    });
  }

  private emitUpdatedList(): void {
    this.onScreenshotsChange.emit(this.localScreenshots);
  }

  // Lightbox Modal
  openLightbox(item: ScreenshotOfAggregator): void {
    const imgUrl = this.imageService.getAssetUrl(item.filePath);
    
    this.modal.create({
      nzTitle: undefined,
      nzContent: `
        <div style="display: flex; justify-content: center; align-items: center; position: relative; padding: 20px;">
          <img src="${imgUrl}" style="max-width: 100%; max-height: 80vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />
        </div>
      `,
      nzFooter: null,
      nzWidth: '960px',
      nzCentered: true,
      nzBodyStyle: {
        padding: '0',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)'
      },
      nzMaskStyle: {
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)'
      }
    });
  }

  // utilities
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
