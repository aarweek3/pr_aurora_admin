export interface DeveloperItemDto {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperDetailDto extends DeveloperItemDto {
  description?: string;
  githubUrl?: string;
  skills: string[];
}

export interface DeveloperCreateDto {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  description?: string;
  githubUrl?: string;
  skills: string[];
}

export interface DeveloperUpdateDto extends DeveloperCreateDto {
  id: number;
}

export interface DeveloperPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'Asc' | 'Desc';
}

export interface DeveloperPagedResponse {
  items: DeveloperItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface DeveloperState {
  items: DeveloperItemDto[];
  total: number;
  loading: boolean;
  searchTerm: string;
  pageNumber: number;
  pageSize: number;
  modalVisible: boolean;
  modalMode: 'add' | 'edit' | 'view';
  editingItem: DeveloperDetailDto | null;
  modalLoading: boolean;
  error: string | null;
  deletingId: number | null;
}

export const INITIAL_DEVELOPER_STATE: DeveloperState = {
  items: [],
  total: 0,
  loading: false,
  searchTerm: '',
  pageNumber: 1,
  pageSize: 10,
  modalVisible: false,
  modalMode: 'add',
  editingItem: null,
  modalLoading: false,
  error: null,
  deletingId: null,
};
