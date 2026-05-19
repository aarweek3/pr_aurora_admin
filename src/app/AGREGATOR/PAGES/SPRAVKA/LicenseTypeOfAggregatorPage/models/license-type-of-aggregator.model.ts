import { SeoDataDto } from '@shared/models/seo.model';
import { ErrorResponse } from '@core/models/error-response.model';

/**
 * Интерфейс локализации типа лицензии
 */
export interface LicenseTypeOfAggregatorLocalizationDto {
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
 * Основной интерфейс типа лицензии (Item для списка)
 */
export interface LicenseTypeOfAggregatorItemDto {
  id: number;
  canonicalName: string;
  localizedName?: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/**
 * Детальная информация о типе лицензии (для формы)
 */
export interface LicenseTypeOfAggregatorDetailDto {
  id: number;
  canonicalName: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  localizations: LicenseTypeOfAggregatorLocalizationDto[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Данные для создания
 */
export interface LicenseTypeOfAggregatorCreateDto {
  canonicalName: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  localizations: LicenseTypeOfAggregatorLocalizationDto[];
}

/**
 * Данные для обновления
 */
export interface LicenseTypeOfAggregatorUpdateDto extends LicenseTypeOfAggregatorCreateDto {
  id: number;
}

/**
 * Ответ со страницей данных
 */
export interface LicenseTypeOfAggregatorPagedResponseDto {
  items: LicenseTypeOfAggregatorItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Параметры запроса списка
 */
export interface LicenseTypeOfAggregatorPageRequestDto {
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
export interface LicenseTypeOfAggregatorState {
  items: LicenseTypeOfAggregatorItemDto[];
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
  editingItem: LicenseTypeOfAggregatorDetailDto | null;
  modalLoading: boolean;

  error: ErrorResponse | null;
  deletingId: number | null;

  // Состояние просмотра
  viewModalVisible: boolean;
  viewItem: LicenseTypeOfAggregatorDetailDto | null;
}

/**
 * Начальное состояние
 */
export const INITIAL_LICENSE_TYPE_STATE: LicenseTypeOfAggregatorState = {
  items: [],
  total: 0,
  loading: false,
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  languageId: null,
  showDeleted: false,
  sortBy: 'CanonicalName',
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
