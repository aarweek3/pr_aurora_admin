import { ErrorResponse } from '@core/models/error-response.model';
import { SeoDataDto } from '../../../shared/models/seo.model';

export interface SampleMainDescriptionSeoDto {
  languageAppId: number;
  languageCode?: string;
  name: string;
  description?: string;
  htmlContent?: string;
  urlPicture?: string;
  seoData?: SeoDataDto;
}

export interface SampleMainSeoItemDto {
  id: number;
  name: string;
  systemCode?: string;
  urlPictureMain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  localizedName?: string;
  seoScore: number;
}

export interface SampleMainSeoDetailDto extends SampleMainSeoItemDto {
  descriptions: SampleMainDescriptionSeoDto[];
}

export interface SampleMainSeoCreateDto {
  name: string;
  systemCode?: string;
  urlPictureMain?: string;
  isActive: boolean;
  descriptions: SampleMainDescriptionSeoDto[];
}

export interface SampleMainSeoUpdateDto extends SampleMainSeoCreateDto {
  id: number;
}

export interface SampleMainSeoPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy?: string;
  sortDirection?: 'Asc' | 'Desc';
}

export interface SampleMainSeoPagedResponse {
  items: SampleMainSeoItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface SampleMainSeoState {
  items: SampleMainSeoItemDto[];
  total: number;
  loading: boolean;
  searchTerm: string;
  languageId: number | null;
  pageNumber: number;
  pageSize: number;
  modalVisible: boolean;
  modalMode: 'add' | 'edit' | 'view';
  editingItem: SampleMainSeoDetailDto | null;
  modalLoading: boolean;
  error: ErrorResponse | null;
  deletingId: number | null; // Новое поле: ID удаляемой записи для спиннера
}

export const INITIAL_SAMPLE_MAIN_SEO_STATE: SampleMainSeoState = {
  items: [],
  total: 0,
  loading: false,
  searchTerm: '',
  languageId: null,
  pageNumber: 1,
  pageSize: 10,
  modalVisible: false,
  modalMode: 'add',
  editingItem: null,
  modalLoading: false,
  error: null,
  deletingId: null, // Начальное значение
};
