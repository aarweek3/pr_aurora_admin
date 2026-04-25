import { ErrorResponse } from "../../../../../shared/infrastructure/interceptor/models/error-response.model";

export enum TagType {
  Functional = 0,
  Technical = 1,
  OS = 2,
  Hardware = 3,
  License = 4,
  Other = 5
}

export interface TagOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  h1Title?: string;
}

export interface TagOfAggregatorItem {
  id: number;
  slug: string;
  categoryTagId: number;
  categoryName?: string;
  type: TagType;
  color: string;
  iconPath?: string;
  isFeature: boolean;
  displayColor?: string;
  displayIcon?: string;
  isActive: boolean;
  sortOrder: number;
  localizedName?: string;
  requiresTranslation: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TagOfAggregatorDetail {
  id: number;
  slug: string;
  categoryTagId: number;
  categoryName?: string;
  type: TagType;
  color: string;
  iconPath?: string;
  isFeature: boolean;
  isActive: boolean;
  sortOrder: number;
  localizedName?: string;
  localizations: TagOfAggregatorLocalization[];
  createdAt: string;
  updatedAt?: string;
}

export interface TagOfAggregatorState {
  items: TagOfAggregatorItem[];
  total: number;
  loading: boolean;
  modalLoading: boolean;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: number;
  searchTerm?: string;
  categoryTagId?: number;
  languageId?: number;
  showDeleted: boolean;
  selectedId: number | null;
  error: ErrorResponse | null;
  categories: any[];
  viewItem: TagOfAggregatorDetail | null;
  viewModalVisible: boolean;
  editModalVisible: boolean;
}

export const initialTagOfAggregatorState: TagOfAggregatorState = {
  items: [],
  total: 0,
  loading: false,
  modalLoading: false,
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'SortOrder',
  sortDirection: 0, // Asc
  searchTerm: '',
  showDeleted: false,
  selectedId: null,
  error: null,
  categories: [],
  viewItem: null,
  viewModalVisible: false,
  editModalVisible: false
};
