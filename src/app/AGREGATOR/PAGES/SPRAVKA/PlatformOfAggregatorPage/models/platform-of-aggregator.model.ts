import { SeoDataDto } from '@shared/models/seo.model';
import { ErrorResponse } from '@core/models/error-response.model';

/**
 * Интерфейс локализации платформы
 */
export interface PlatformOfAggregatorLocalizationDto {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  languageNativeName?: string;
  name: string;
  description?: string;
  htmlContent?: string;
  urlPicture?: string;
  seoData?: SeoDataDto;
}

/**
 * Основной интерфейс платформы (Item для списка)
 */
export interface PlatformOfAggregatorItemDto {
  id: number;
  name: string;
  localizedName?: string;
  systemCode: string;
  iconPath?: string;
  sortOrder: number;
  isActive: boolean;
  programsCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/**
 * Детальная информация о платформе (для формы)
 */
export interface PlatformOfAggregatorDetailDto {
  id: number;
  name: string;
  systemCode: string;
  iconPath?: string;
  sortOrder: number;
  isActive: boolean;
  localizations: PlatformOfAggregatorLocalizationDto[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Данные для создания
 */
export interface PlatformOfAggregatorCreateDto {
  name: string;
  systemCode: string;
  iconPath?: string;
  sortOrder: number;
  isActive: boolean;
  localizations: PlatformOfAggregatorLocalizationDto[];
}

/**
 * Данные для обновления
 */
export interface PlatformOfAggregatorUpdateDto extends PlatformOfAggregatorCreateDto {
  id: number;
}

/**
 * Ответ со страницей данных
 */
export interface PlatformOfAggregatorPagedResponseDto {
  items: PlatformOfAggregatorItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Параметры запроса списка
 */
export interface PlatformOfAggregatorPageRequestDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy?: string;
  sortDirection?: number;
  showDeleted?: boolean;
}

/**
 * Состояние модуля в Store/Service
 */
export interface PlatformOfAggregatorState {
  items: PlatformOfAggregatorItemDto[];
  total: number;
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  languageId: number | null;
  showDeleted: boolean;
  sortBy: string;
  sortDirection: number;

  // Состояние модалки/формы
  modalVisible: boolean;
  modalMode: 'add' | 'edit';
  editingItem: PlatformOfAggregatorDetailDto | null;
  modalLoading: boolean;

  error: ErrorResponse | null;
  deletingId: number | null;

  // Состояние просмотра
  viewModalVisible: boolean;
  viewItem: PlatformOfAggregatorDetailDto | null;
}

/**
 * Начальное состояние
 */
export const INITIAL_PLATFORM_STATE: PlatformOfAggregatorState = {
  items: [],
  total: 0,
  loading: false,
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  languageId: null,
  showDeleted: false,
  sortBy: 'Name',
  sortDirection: 0,

  modalVisible: false,
  modalMode: 'add',
  editingItem: null,
  modalLoading: false,

  error: null,
  deletingId: null,

  viewModalVisible: false,
  viewItem: null,
};
