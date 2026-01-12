// --- DTOs ---
export interface SampleSimpleDto {
  id: number;
  name: string;
  description?: string;
}

export interface SampleSimpleCreateDto {
  name: string;
  description?: string;
}

export interface SampleSimpleUpdateDto extends SampleSimpleCreateDto {
  id: number;
}

export interface SampleSimplePageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface SampleSimplePagedResponse {
  items: SampleSimpleDto[];
  total: number;
}

// --- State ---
export interface SampleSimpleState {
  items: SampleSimpleDto[];
  total: number;
  loading: boolean;
  searchTerm: string;
  pageNumber: number;
  pageSize: number;

  // Modal state
  modalVisible: boolean;
  modalMode: 'add' | 'edit' | 'view';
  editingItem: SampleSimpleDto | null;
  modalLoading: boolean;
  modalError: string | null;
}

export const INITIAL_SIMPLE_STATE: SampleSimpleState = {
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
  modalError: null,
};
