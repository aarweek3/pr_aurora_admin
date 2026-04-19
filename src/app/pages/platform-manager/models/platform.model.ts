import { ErrorResponse } from '../../../shared/infrastructure/interceptor/models/error-response.model';
import { SeoDataDto } from '../../../shared/models/seo.model';

export interface PlatformTranslationDto {
  languageId: number;
  languageCode?: string;
  name: string;
  description?: string;
  descriptionFull?: string;
  urlPicture?: string;
  seoData?: SeoDataDto;
}

export interface PlatformItemDto {
  id: string; // Guid
  name: string; // Technical name
  code: string;
  family?: string;
  urlPictureMain?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  localizedName?: string;
}

export interface PlatformDetailDto extends PlatformItemDto {
  translations: PlatformTranslationDto[];
}

export interface PlatformCreateDto {
  name: string;
  code: string;
  family?: string;
  urlPictureMain?: string;
  isActive: boolean;
  sortOrder: number;
  translations: PlatformTranslationDto[];
}

export interface PlatformUpdateDto extends PlatformCreateDto {
  id: string;
}

export interface PlatformPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy?: string;
  sortDirection?: 'Asc' | 'Desc';
}

export interface PlatformPagedResponse {
  items: PlatformItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface PlatformState {
  items: PlatformItemDto[];
  total: number;
  loading: boolean;
  searchTerm: string;
  languageId: number | null;
  pageNumber: number;
  pageSize: number;
  editingItem: PlatformDetailDto | null;
  viewItem: PlatformDetailDto | null;
  pageLoading: boolean;
  error: ErrorResponse | null;
  deletingId: string | null;
}

export const INITIAL_PLATFORM_STATE: PlatformState = {
  items: [],
  total: 0,
  loading: false,
  searchTerm: '',
  languageId: null,
  pageNumber: 1,
  pageSize: 10,
  editingItem: null,
  viewItem: null,
  pageLoading: false,
  error: null,
  deletingId: null,
};
