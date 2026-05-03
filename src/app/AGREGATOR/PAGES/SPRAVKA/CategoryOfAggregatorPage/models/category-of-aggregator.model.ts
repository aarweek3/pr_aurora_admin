import { ErrorResponse } from '../../../../../shared/infrastructure/interceptor/models/error-response.model';

export interface CategoryOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  languageNativeName?: string;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CategoryOfAggregatorItem {
  id: number;
  canonicalName: string;
  slug: string;
  parentId?: number;
  parentName?: string;
  iconPath?: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  localizedName?: string;
  childrenCount: number;
  programsCount: number;
  // Для Tree Table (Ng-Zorro)
  expand?: boolean;
  level?: number;
  children?: CategoryOfAggregatorItem[];
}

export interface CategoryOfAggregatorDetail {
  id: number;
  canonicalName: string;
  slug: string;
  parentId?: number;
  iconPath?: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  localizations: CategoryOfAggregatorLocalization[];
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryOfAggregatorPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy: string;
  sortDirection: number; // 0 - Asc, 1 - Desc
  showDeleted: boolean;
  parentId?: number;
}

export interface CategoryOfAggregatorPagedResponse {
  items: CategoryOfAggregatorItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface CategoryOfAggregatorState extends CategoryOfAggregatorPageRequest {
  items: CategoryOfAggregatorItem[];
  total: number;
  loading: boolean;
  modalLoading: boolean;
  error: ErrorResponse | null;
  selectedId: number | null;
  viewMode: 'modal' | 'inline' | 'page';
  viewModalVisible: boolean;
  viewItem: CategoryOfAggregatorDetail | null;
}

export const initialCategoryOfAggregatorState: CategoryOfAggregatorState = {
  items: [],
  total: 0,
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  languageId: 1,
  sortBy: 'SortOrder',
  sortDirection: 0,
  showDeleted: false,
  loading: false,
  modalLoading: false,
  error: null,
  selectedId: null,
  viewMode: 'modal',
  viewModalVisible: false,
  viewItem: null
};
