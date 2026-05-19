import { ErrorResponse } from '@core/models/error-response.model';

/**
 * Архитектуры процессоров
 */
export enum RequirementArchitecture {
  Any = 0,
  X86 = 1,
  X64 = 2,
  Arm64 = 3,
}

/**
 * Версия ОС (Справочник)
 */
export interface PlatformOsVersionDto {
  id: number;
  platformId: number;
  name: string;
  systemCode: string;
  sortOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  localizations?: PlatformOsVersionLocalizationDto[];
}

export interface PlatformOsVersionLocalizationDto {
  languageId: number;
  name: string;
  description?: string;
}

/**
 * Локализация требования
 */
export interface SystemRequirementLocalizationDto {
  languageId: number;
  additionalNotes?: string;
}

/**
 * Системное требование
 */
export interface SystemRequirementDto {
  id: number;
  versionId: number;
  platformId: number;
  platformName: string;
  architecture: RequirementArchitecture;
  minOsVersionId?: number;
  minOsVersionName?: string;
  maxOsVersionId?: number;
  maxOsVersionName?: string;
  isRecommended: boolean;
  localizations: SystemRequirementLocalizationDto[];
}

/**
 * Создание требования
 */
export interface SystemRequirementCreateDto {
  versionId: number;
  platformId: number;
  architecture: RequirementArchitecture;
  minOsVersionId?: number;
  maxOsVersionId?: number;
  isRecommended: boolean;
  localizations: SystemRequirementLocalizationDto[];
}

/**
 * Обновление требования
 */
export interface SystemRequirementUpdateDto extends SystemRequirementCreateDto {
  id: number;
}

/**
 * Запрос списка ОС
 */
export interface PlatformOsVersionPageRequestDto {
  platformId?: number;
  searchTerm?: string;
  languageId?: number;
  showDeleted?: boolean;
  pageNumber: number;
  pageSize: number;
}

/**
 * Ответ списка ОС
 */
export interface PlatformOsVersionPagedResponseDto {
  items: PlatformOsVersionDto[];
  totalCount: number;
}

/**
 * Состояние модуля (Signals SSOT)
 */
export interface SystemRequirementState {
  // Справочник ОС (кешируется для выбора)
  osVersions: PlatformOsVersionDto[];
  osVersionsLoading: boolean;
  osVersionsTotal: number;
  osSearchTerm: string;
  osLanguageId: number | null;
  osShowDeleted: boolean;
  osModalVisible: boolean;
  osModalMode: 'add' | 'edit' | 'view';
  osEditingItem: PlatformOsVersionDto | null;
  osModalLoading: boolean;
  osPageNumber: number;
  osPageSize: number;

  // Требования для текущей версии программы
  requirements: SystemRequirementDto[];
  loading: boolean;

  // Состояние модального окна
  modalVisible: boolean;
  modalMode: 'add' | 'edit';
  editingItem: SystemRequirementDto | null;
  modalLoading: boolean;

  error: ErrorResponse | null;
}

/**
 * Начальное состояние
 */
export const INITIAL_REQUIREMENT_STATE: SystemRequirementState = {
  osVersions: [],
  osVersionsLoading: false,
  osVersionsTotal: 0,
  osSearchTerm: '',
  osLanguageId: null,
  osShowDeleted: false,
  osModalVisible: false,
  osModalMode: 'view',
  osEditingItem: null,
  osModalLoading: false,
  osPageNumber: 1,
  osPageSize: 10,
  requirements: [],
  loading: false,
  modalVisible: false,
  modalMode: 'add',
  editingItem: null,
  modalLoading: false,
  error: null,
};
