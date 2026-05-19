import { ErrorResponse } from '@core/models/error-response.model';

export interface CategoryLocalizationDto {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface SubcategoryItemDto {
  id: number;
  categoryId: number;
  categoryName?: string;
  canonicalName: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  localizedName?: string;
  programsCount: number;
}

export interface CategoryItemDto {
  id: number;
  canonicalName: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  localizedName?: string;
  subcategoriesCount: number;
  programsCount: number;
}

export interface SubcategoryDetailDto {
  id: number;
  categoryId: number;
  canonicalName: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  localizations: CategoryLocalizationDto[];
}

export interface CategoryDetailDto {
  id: number;
  canonicalName: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  localizations: CategoryLocalizationDto[];
  subcategories: SubcategoryItemDto[];
}

export interface CategorySimplifiedPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy: string;
  sortDirection: number; // 0 - Asc, 1 - Desc
  showDeleted: boolean;
}

export interface CategorySimplifiedPagedResponse {
  items: CategoryItemDto[];
  total: number;
}

export interface CategoryIconDto {
  name: string;
  svgCodIcon: string;
}

export interface CategorySimplifiedState extends CategorySimplifiedPageRequest {
  items: CategoryItemDto[];
  total: number;
  loading: boolean;
  modalLoading: boolean;
  error: ErrorResponse | null;
  selectedCategoryId: number | null;
  selectedSubcategoryId: number | null;
  viewMode: 'modal' | 'page';
  viewModalVisible: boolean;
  viewCategory: CategoryDetailDto | null;
  viewSubcategory: SubcategoryDetailDto | null;
  isReadOnly: boolean;
  customIcons: CategoryIconDto[];
}

export const initialCategorySimplifiedState: CategorySimplifiedState = {
  items: [],
  total: 0,
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  languageId: undefined,
  sortBy: 'SortOrder',
  sortDirection: 0,
  showDeleted: false,
  loading: false,
  modalLoading: false,
  error: null,
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  viewMode: 'modal',
  viewModalVisible: false,
  viewCategory: null,
  viewSubcategory: null,
  isReadOnly: false,
  customIcons: [],
};
