import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiEndpoints } from '../../../../../environments/api-endpoints';
import { AvIconConfig, IconComponent } from '../../../../shared/components/ui/icon';
import { IconDataService } from '../../../../shared/services/icon-data.service';
import { AvIconCategory } from './icon-metadata.model';
import { ICON_REGISTRY } from './icon-registry';

@Component({
  selector: 'av-icon-ui',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <!-- Icon UI Component: IconUiComponent (src/app/pages/ui-demo/icon-ui/icon-ui.component.ts) -->
    <div class="icon-ui">
      <!-- Header Section -->
      <div class="icon-ui__header glass">
        <div class="header-main">
          <div class="title-group">
            <div class="title-with-badge">
              <h1>Icon Library</h1>
              <span class="source-badge" [class.backend]="dataSource() === 'backend'">
                {{ dataSource() === 'backend' ? '☁️ Backend' : '🏠 Local' }}
              </span>
            </div>

            <p class="text-secondary">
              {{ totalIcons() }} иконок в {{ categories().length }} категориях
            </p>
            <div class="action-info">
              <p class="text-secondary">Компонент: IconUiComponent</p>
              @if (dataSource() === 'backend') {
              <button
                class="sync-btn"
                [disabled]="isSyncing()"
                (click)="syncToLocal()"
                title="Синхронизировать бэкенд с локальным файлом"
              >
                @if (isSyncing()) {
                <div class="small-spinner"></div>
                Syncing... } @else {
                <av-icon type="actions/av_save" [size]="14"></av-icon>
                Sync to Local }
              </button>
              }
            </div>
          </div>

          <div class="search-box">
            <av-icon type="actions/av_search" [size]="18" class="search-icon"></av-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Поиск иконок по названию или категории..."
              class="search-input"
            />
            @if (searchQuery()) {
            <button class="clear-btn" (click)="searchQuery.set('')">
              <av-icon type="actions/av_close" [size]="14"></av-icon>
            </button>
            }
          </div>
        </div>

        <!-- Main Content -->
        <div class="icon-ui__content">
          @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка библиотеки иконок...</p>
          </div>
          } @else if (filteredCategories().length === 0) {
          <div class="empty-state">
            <av-icon type="system/av_info" [size]="48"></av-icon>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить поисковый запрос</p>
          </div>
          } @for (cat of filteredCategories(); track cat.category) {
          <section class="category-section">
            <h2 class="category-title">
              {{ cat.category }}
              <span class="count">{{ cat.icons.length }}</span>
            </h2>

            <div class="icon-grid">
              @for (icon of cat.icons; track icon.type) {
              <div class="icon-card" (click)="copyToClipboard(icon.type)">
                <div class="icon-preview" [style.color]="activeColor()">
                  <av-icon [type]="icon.type" [size]="iconSize()"></av-icon>
                </div>
                <div class="icon-info">
                  <span class="icon-name" [title]="icon.name">{{ icon.name }}</span>
                  <button class="copy-hint" (click)="$event.stopPropagation(); copyCode(icon.type)">
                    <av-icon type="actions/av_save" [size]="12"></av-icon>
                    Code
                  </button>
                </div>
              </div>
              }
            </div>
          </section>
          }
        </div>
      </div>
    </div>
  `,

  styles: [
    `
      .icon-ui {
        padding: 24px;
        min-height: 100vh;
        background: var(--bg-primary);
      }

      .glass {
        background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.8);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(var(--border-color-rgb, 0, 0, 0), 0.1);
      }

      .icon-ui__header {
        padding: 24px 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 24px;
      }

      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 32px;
      }

      .title-group h1 {
        margin: 0;
        font-size: 24px;
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .title-with-badge {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
      }

      .source-badge {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        background: #f1f5f9;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        border: 1px solid #e2e8f0;

        &.backend {
          background: #e0e7ff;
          color: #4338ca;
          border-color: #c7d2fe;
        }
      }

      .action-info {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 4px;
      }

      .sync-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #6366f1;
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      .search-box {
        flex: 1;
        max-width: 500px;
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        color: var(--text-tertiary);
      }

      .search-input {
        width: 100%;
        padding: 10px 40px;
        border-radius: 12px;
        border: 1px solid rgba(var(--border-color-rgb, 0, 0, 0), 0.15);
        background: rgba(var(--bg-secondary-rgb, 240, 240, 240), 0.5);
        outline: none;
        transition: all 0.2s;
      }

      .search-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .clear-btn {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-tertiary);
        display: flex;
      }

      .controls {
        display: flex;
        gap: 40px;
        align-items: center;
      }

      /* Grid Styles */
      .category-section {
        margin-bottom: 48px;
      }

      .category-title {
        font-size: 18px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .category-title .count {
        font-size: 12px;
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
        padding: 2px 8px;
        border-radius: 10px;
      }

      .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 16px;
      }

      .icon-card {
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 16px;
        padding: 20px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .icon-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        border-color: #6366f1;
      }

      .icon-preview {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .icon-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .icon-name {
        font-size: 12px;
        color: var(--text-secondary);
        text-align: center;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .copy-hint {
        font-size: 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #64748b;
        padding: 4px 8px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .icon-card:hover .copy-hint {
        opacity: 1;
      }

      .copy-hint:hover {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #3b82f6;
      }

      .empty-state {
        text-align: center;
        padding: 80px 0;
        color: var(--text-tertiary);
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 100px 0;
        gap: 20px;
        color: #6366f1;

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        p {
          font-weight: 500;
          font-size: 16px;
        }
      }

      .small-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class IconUiComponent {
  private iconService = inject(IconDataService);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);

  // Reactive state
  searchQuery = signal('');
  toastMessage = signal(''); // Keeps for compatibility if used elsewhere, but we'll use nz-message
  categories = signal<AvIconCategory[]>([]);
  isLoading = signal(true);
  isSyncing = signal(false);
  dataSource = signal<'backend' | 'local'>('local');

  constructor() {
    this.loadIcons();
  }

  private loadIcons() {
    this.isLoading.set(true);
    this.iconService.getIcons().subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) => {
          if (a.category === 'Другие') return 1;
          if (b.category === 'Другие') return -1;
          return a.category.localeCompare(b.category);
        });
        this.categories.set(sorted);
        this.dataSource.set('backend');
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load icons', err);
        // Fallback to registry if API fails
        this.categories.set([...ICON_REGISTRY]);
        this.dataSource.set('local');
        this.isLoading.set(false);
        this.message.warning('Используется локальная библиотека иконок (бэкенд недоступен)');
      },
    });
  }

  syncToLocal() {
    this.isSyncing.set(true);
    this.http.post(ApiEndpoints.ICONS.SYNC_TO_LOCAL, {}).subscribe({
      next: () => {
        this.message.success('✅ Библиотека иконок успешно синхронизирована с фронтендом!');
        this.isSyncing.set(false);
      },
      error: (err: unknown) => {
        console.error('Sync failed', err);
        this.message.error('❌ Ошибка синхронизации иконок');
        this.isSyncing.set(false);
      },
    });
  }

  // Icon configuration for our settings control
  iconConfig = signal<AvIconConfig>({
    type: null,
    size: 24,
    color: '#1e293b',
    rotation: 0,
    scale: 1,
    opacity: 1,
    flipX: false,
    flipY: false,
    padding: 0,
    background: 'transparent',
    borderShow: false,
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 0,
  });

  // Computed properties for backward compatibility
  iconSize = computed(() => this.iconConfig().size);
  activeColor = computed(() => this.iconConfig().color);

  // Icon presets for the settings control
  iconPresets = computed(() => {
    return ICON_REGISTRY.flatMap((category) =>
      category.icons.map((icon) => ({
        value: icon.type,
        label: icon.name,
        category: category.category,
      })),
    );
  });

  // Computed state
  totalIcons = computed(() => {
    return this.categories().reduce((acc, cat) => acc + cat.icons.length, 0);
  });

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.categories();

    return this.categories()
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter(
          (icon) =>
            icon.name.toLowerCase().includes(query) || cat.category.toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.icons.length > 0);
  });

  copyToClipboard(type: string) {
    navigator.clipboard.writeText(type);
    this.showToast(`Тип иконки "${type}" скопирован!`);
  }

  copyCode(type: string) {
    const code = `<av-icon type="${type}" [size]="${this.iconSize()}"></av-icon>`;
    navigator.clipboard.writeText(code);
    this.showToast('Код компонента скопирован!');
  }

  private showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
