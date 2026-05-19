import { ErrorResponse } from '@core/models/error-response.model';

export interface DeveloperOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  languageNativeName?: string;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface DeveloperOfAggregatorItem {
  id: number;
  name: string;
  systemCode: string;
  website?: string;
  iconPath?: string;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  localizedName?: string;
  programsCount: number;
}

export interface DeveloperOfAggregatorDetail {
  id: number;
  name: string;
  systemCode: string;
  website?: string;
  iconPath?: string;
  isActive: boolean;
  sortOrder: number;
  localizations: DeveloperOfAggregatorLocalization[];
  createdAt: string;
  updatedAt?: string;
}

export interface DeveloperOfAggregatorPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy: string;
  sortDirection: number; // 0 - Asc, 1 - Desc
  showDeleted: boolean;
}

export interface DeveloperOfAggregatorPagedResponse {
  items: DeveloperOfAggregatorItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface DeveloperOfAggregatorState extends DeveloperOfAggregatorPageRequest {
  items: DeveloperOfAggregatorItem[];
  total: number;
  loading: boolean;
  modalLoading: boolean;
  error: ErrorResponse | null;
  selectedId: number | null;
  viewMode: 'modal' | 'inline' | 'page';
  viewModalVisible: boolean;
  viewItem: DeveloperOfAggregatorDetail | null;
}

export const initialDeveloperOfAggregatorState: DeveloperOfAggregatorState = {
  items: [],
  total: 0,
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  languageId: undefined,
  sortBy: 'Name',
  sortDirection: 0,
  showDeleted: false,
  loading: false,
  modalLoading: false,
  error: null,
  selectedId: null,
  viewMode: 'modal',
  viewModalVisible: false,
  viewItem: null,
};
