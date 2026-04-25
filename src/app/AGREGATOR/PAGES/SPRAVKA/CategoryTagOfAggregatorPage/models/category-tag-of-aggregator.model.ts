import { ErrorResponse } from "../../../../../shared/infrastructure/interceptor/models/error-response.model";

export interface CategoryTagOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  name: string;
  description?: string;
}

export interface CategoryTagOfAggregatorItem {
  id: number;
  slug: string;
  iconPath?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  localizedName?: string;
  tagsCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryTagOfAggregatorDetail {
  id: number;
  slug: string;
  iconPath?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  localizations: CategoryTagOfAggregatorLocalization[];
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryTagOfAggregatorState {
  items: CategoryTagOfAggregatorItem[];
  total: number;
  loading: boolean;
  modalLoading: boolean;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: number;
  searchTerm?: string;
  languageId: number | null;
  showDeleted: boolean;
  selectedId: number | null;
  error: ErrorResponse | null;
}

export const initialCategoryTagOfAggregatorState: CategoryTagOfAggregatorState = {
  items: [],
  total: 0,
  loading: false,
  modalLoading: false,
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'SortOrder',
  sortDirection: 0, // Asc
  searchTerm: '',
  languageId: null,
  showDeleted: false,
  selectedId: null,
  error: null
};
