import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguageService } from '@language-app/services/language.service';
import { AppLanguage } from '@language-app/models/appLanguage.model';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Subject } from 'rxjs';
import { finalize, shareReplay, takeUntil } from 'rxjs/operators';
import { ErrorResponse } from '@core/models/error-response.model';
import { PlatformOfAggregatorStateService } from '../../PlatformOfAggregatorPage/services/platform-of-aggregator-state.service';
import {
  INITIAL_REQUIREMENT_STATE,
  PlatformOsVersionDto,
  SystemRequirementCreateDto,
  SystemRequirementDto,
  SystemRequirementState,
  SystemRequirementUpdateDto,
} from '../models/system-requirement.model';
import { SystemRequirementApiService } from './system-requirement-api.service';

@Injectable({
  providedIn: 'root',
})
export class SystemRequirementStateService implements OnDestroy {
  private api = inject(SystemRequirementApiService);
  private message = inject(NzMessageService);
  private langService = inject(LanguageService);
  private modalService = inject(ModalService);
  private platformState = inject(PlatformOfAggregatorStateService);
  private destroy$ = new Subject<void>();

  // Single Source of Truth (Signal)
  readonly state = signal<SystemRequirementState>(INITIAL_REQUIREMENT_STATE);

  // ---------- SELECTORS (Computed Signals) ----------
  readonly requirements = computed(() => this.state().requirements);
  readonly osVersions = computed(() => this.state().osVersions);
  readonly loading = computed(() => this.state().loading);
  readonly osVersionsLoading = computed(() => this.state().osVersionsLoading);
  readonly osVersionsTotal = computed(() => this.state().osVersionsTotal);
  readonly osSearchTerm = computed(() => this.state().osSearchTerm);
  readonly osLanguageId = computed(() => this.state().osLanguageId);
  readonly osShowDeleted = computed(() => this.state().osShowDeleted);
  readonly osModalVisible = computed(() => this.state().osModalVisible);
  readonly osModalMode = computed(() => this.state().osModalMode);
  readonly osEditingItem = computed(() => this.state().osEditingItem);
  readonly osModalLoading = computed(() => this.state().osModalLoading);
  readonly osPageNumber = computed(() => this.state().osPageNumber);
  readonly osPageSize = computed(() => this.state().osPageSize);
  readonly modalVisible = computed(() => this.state().modalVisible);
  readonly modalMode = computed(() => this.state().modalMode);
  readonly editingItem = computed(() => this.state().editingItem);
  readonly modalLoading = computed(() => this.state().modalLoading);
  readonly error = computed(() => this.state().error);

  // Платформы доступны? (для проверки зависимостей)
  readonly hasPlatforms = computed(() => (this.platformState.total() || 0) > 0);

  // Список языков для локализаций
  readonly languages = computed<AppLanguage[]>(() => this.langService.availableLanguages() || []);

  constructor() {}

  // ---------- HELPERS ----------
  private executeWithLoading<T>(
    operation: Observable<T>,
    isModal = false,
    isOsLookup = false,
  ): Observable<T> {
    const loadingKey = isModal ? 'modalLoading' : isOsLookup ? 'osVersionsLoading' : 'loading';
    this.updateState({ [loadingKey]: true, error: null } as any);

    return operation.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.updateState({ [loadingKey]: false } as any)),
    );
  }

  private handleError(err: any, context: string): void {
    const errorResponse = ErrorResponse.fromError(err, context);
    this.updateState({ error: errorResponse });
    this.message.error(errorResponse.getUserMessage());
  }

  private updateState(partial: Partial<SystemRequirementState>): void {
    this.state.update((s) => ({ ...s, ...partial }));
  }

  // ---------- ACTIONS ----------

  /**
   * Загрузить справочник версий ОС
   */
  loadOsVersions(platformId?: any, checkEmpty = false): void {
    const s = this.state();

    // Нормализуем platformId (может прийти строка или 0)
    const pId = platformId && Number(platformId) !== 0 ? Number(platformId) : undefined;

    console.warn('[SystemRequirement] Loading OS versions for platform:', pId);

    // Сначала убедимся, что загружены данные о платформах (нужно для проверки зависимостей)
    if (this.platformState.total() === null) {
      this.platformState.loadItems();
    }

    this.executeWithLoading(
      this.api.getOsVersions({
        platformId: pId,
        searchTerm: s.osSearchTerm,
        languageId: s.osLanguageId || undefined,
        showDeleted: s.osShowDeleted,
        pageNumber: s.osPageNumber,
        pageSize: s.osPageSize,
      }),
      false,
      true,
    ).subscribe({
      next: (res) => {
        console.log('[SystemRequirement] OS versions received:', res.items?.length || 0);
        this.updateState({
          osVersions: res.items,
          osVersionsTotal: res.totalCount,
        });

        if (checkEmpty) {
          // ПРОВЕРКА 1: Пустые платформы (Критическая зависимость)
          if (!this.hasPlatforms()) {
            this.modalService.alert({
              title: 'Внимание: Операционные системы не найдены!',
              message:
                'Справочник операционных систем пуст. Версии ОС должны быть привязаны к конкретной системе (Windows, Android и т.д.). \n\n**Совет:** Сначала перейдите в раздел **"Операционные системы"** и выполните там перенос данных из JSON.',
              alertType: 'warning',
              centered: true,
              icon: 'system/av_info',
            });
            return;
          }

          // ПРОВЕРКА 2: Пустые версии ОС
          if (res.totalCount === 0) {
            this.modalService.alert({
              title: 'База данных пуста!',
              message:
                "В базе данных 'DbNames' (таблица 'os_versions') нет записей для отображения. Вы можете инициализировать данные из JSON файла в блоке обслуживания.",
              alertType: 'info',
              centered: true,
              icon: 'system/av_info',
            });
          } else {
            this.modalService.alert({
              title: 'Обновление завершено',
              message: `Данные из БД считаны. Всего загружено записей: ${res.totalCount}`,
              alertType: 'success',
              centered: true,
              icon: 'general/av_check-circle',
            });
          }
        }
      },
      error: (err) => this.handleError(err, 'LoadOsVersions'),
    });
  }

  /**
   * Загрузить детали версии ОС и открыть просмотр
   */
  loadOsVersionDetail(id: number): void {
    this.executeWithLoading(this.api.getOsVersionById(id), false, true).subscribe({
      next: (item) => {
        this.updateState({
          osEditingItem: item,
          osModalVisible: true,
          osModalMode: 'view',
        });
      },
      error: (err) => this.handleError(err, 'LoadOsVersionDetail'),
    });
  }

  /**
   * Обновить текущий редактируемый элемент ОС (локально)
   */
  updateOsEditingItem(changes: Partial<PlatformOsVersionDto>): void {
    const current = this.state().osEditingItem;
    if (current) {
      this.updateState({ osEditingItem: { ...current, ...changes } });
    } else if (this.state().osModalMode === 'add') {
      this.updateState({ osEditingItem: { ...changes } as PlatformOsVersionDto });
    }
  }

  /**
   * Сохранить версию ОС (Создать или Обновить)
   */
  saveOsVersion(): void {
    const s = this.state();
    const item = s.osEditingItem;
    if (!item) return;

    this.updateState({ osModalLoading: true });

    const request =
      s.osModalMode === 'add'
        ? this.api.createOsVersion(item)
        : this.api.updateOsVersion(item.id, item);

    request.pipe(finalize(() => this.updateState({ osModalLoading: false }))).subscribe({
      next: () => {
        this.message.success(s.osModalMode === 'add' ? 'Версия ОС создана' : 'Версия ОС обновлена');
        this.closeOsOsModal();
        this.loadOsVersions();
      },
      error: (err) => this.handleError(err, 'SaveOsVersion'),
    });
  }

  /**
   * Открыть модальное окно (создание/редактирование)
   */
  openOsModal(mode: 'add' | 'edit' | 'view', item: PlatformOsVersionDto | null = null): void {
    this.updateState({
      osModalVisible: true,
      osModalMode: mode,
      osEditingItem: item,
    });
  }

  /**
   * Закрыть модальное окно
   */
  closeOsOsModal(): void {
    this.updateState({
      osModalVisible: false,
      osEditingItem: null,
    });
  }

  /**
   * Установить страницу для ОС
   */
  setOsPageNumber(page: number): void {
    this.updateState({ osPageNumber: page });
    this.loadOsVersions(); // В идеале тут нужен доступ к текущему platformId
  }

  /**
   * Установить размер страницы для ОС
   */
  setOsPageSize(size: number): void {
    this.updateState({ osPageSize: size, osPageNumber: 1 });
    this.loadOsVersions();
  }

  /**
   * Установить строку поиска для ОС
   */
  setOsSearchTerm(term: string): void {
    if (this.state().osSearchTerm === term) return;
    this.updateState({ osSearchTerm: term });
    this.loadOsVersions();
  }

  /**
   * Установить язык для ОС
   */
  setOsLanguageId(id: number | null): void {
    if (this.state().osLanguageId === id) return;
    this.updateState({ osLanguageId: id });
    this.loadOsVersions();
  }

  /**
   * Переключить отображение удаленных ОС
   */
  setOsShowDeleted(show: boolean): void {
    if (this.state().osShowDeleted === show) return;
    this.updateState({ osShowDeleted: show });
    this.loadOsVersions();
  }

  /**
   * Загрузить требования для конкретной версии программы
   */
  loadRequirements(versionId: number): void {
    this.executeWithLoading(this.api.getByVersionId(versionId)).subscribe({
      next: (res) => this.updateState({ requirements: res }),
      error: (err) => this.handleError(err, 'LoadRequirements'),
    });
  }

  /**
   * Открыть модалку для добавления требования
   */
  openAddModal(versionId: number, platformId: number): void {
    this.loadOsVersions(platformId);
    this.updateState({
      modalVisible: true,
      modalMode: 'add',
      editingItem: {
        versionId,
        platformId,
        architecture: 0,
        isRecommended: false,
        localizations: [],
      } as any,
    });
  }

  /**
   * Открыть модалку для редактирования
   */
  openEditModal(item: SystemRequirementDto): void {
    this.loadOsVersions(item.platformId);
    this.updateState({
      modalVisible: true,
      modalMode: 'edit',
      editingItem: item,
    });
  }

  /**
   * Закрыть модалку
   */
  closeModal(): void {
    this.updateState({ modalVisible: false, editingItem: null, error: null });
  }

  /**
   * Сохранить (Создать или Обновить)
   */
  save(data: SystemRequirementCreateDto | SystemRequirementUpdateDto): void {
    const isAdd = this.state().modalMode === 'add';

    console.group(
      '%c [PAYLOAD] Saving System Requirement ',
      'background: #0052cc; color: #fff; padding: 4px;',
    );
    console.log('Action:', isAdd ? 'CREATE' : 'UPDATE');
    console.log('Data:', data);
    console.groupEnd();

    const request = isAdd
      ? this.api.create(data as SystemRequirementCreateDto)
      : this.api.update(
          (data as SystemRequirementUpdateDto).id,
          data as SystemRequirementUpdateDto,
        );

    this.executeWithLoading(request, true).subscribe({
      next: () => {
        const msg = isAdd
          ? `Требование добавлено для версии ${data.versionId}`
          : `Требование ID:${(data as any).id} обновлено`;

        this.message.success(msg);
        this.closeModal();
        this.loadRequirements(data.versionId);
      },
      error: (err) => this.handleError(err, 'Save'),
    });
  }

  /**
   * Удалить требование
   */
  delete(id: number, versionId: number): void {
    this.executeWithLoading(this.api.delete(id)).subscribe({
      next: () => {
        this.message.success('Требование удалено');
        this.loadRequirements(versionId);
      },
      error: (err) => this.handleError(err, 'Delete'),
    });
  }

  /**
   * Удалить версию ОС (Soft Delete)
   */
  deleteOsVersion(id: number): void {
    this.executeWithLoading(this.api.deleteOsVersion(id), false, true).subscribe({
      next: () => {
        this.message.success('Версия ОС удалена (Soft Delete)');
        this.loadOsVersions();
      },
      error: (err) => this.handleError(err, 'DeleteOsVersion'),
    });
  }

  /**
   * Удалить версию ОС навсегда (Hard Delete)
   */
  hardDeleteOsVersion(id: number): void {
    this.executeWithLoading(this.api.deleteOsVersion(id, true), false, true).subscribe({
      next: () => {
        this.message.success('Версия ОС безвозвратно удалена');
        this.loadOsVersions();
      },
      error: (err) => this.handleError(err, 'HardDeleteOsVersion'),
    });
  }

  /**
   * Сидинг справочника ОС
   */
  seedOsVersions(): void {
    const s = this.state();

    // ПРОВЕРКА 1: Наличие платформ (Зависимость)
    if (!this.hasPlatforms()) {
      this.modalService.alert({
        title: 'Перенос невозможен',
        message:
          'Справочник операционных систем пуст. Версии ОС должны быть привязаны к системе. \n\nПожалуйста, сначала перейдите в раздел **"Операционные системы"** и выполните там перенос данных из JSON.',
        alertType: 'warning',
        centered: true,
        icon: 'system/av_info',
      });
      return;
    }

    // ПРОВЕРКА 2: Наличие данных (Дубликаты)
    if (s.osVersionsTotal > 0) {
      this.modalService.alert({
        title: 'Перенос невозможен',
        message: 'В БД уже есть записи. Для нового переноса очистите базу данных.',
        alertType: 'warning',
        centered: true,
        icon: 'system/av_info',
      });
      return;
    }

    const msgId = this.message.loading('Импорт данных из JSON...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.seedOsVersions(), false, true).subscribe({
      next: (res) => {
        this.message.remove(msgId);
        this.message.success(res.message);
        this.loadOsVersions(undefined, true);
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Seed');
      },
    });
  }

  /**
   * Полная очистка справочника ОС
   */
  clearOsVersions(): void {
    const msgId = this.message.loading('Очистка базы данных...', { nzDuration: 0 }).messageId;
    this.executeWithLoading(this.api.clearOsVersions(), false, true).subscribe({
      next: () => {
        this.message.remove(msgId);
        this.message.success('Справочник ОС очищен');
        this.loadOsVersions(undefined, true);
      },
      error: (err) => {
        this.message.remove(msgId);
        this.handleError(err, 'Clear');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
