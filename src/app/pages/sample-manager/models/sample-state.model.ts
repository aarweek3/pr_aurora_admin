import { ErrorResponse } from '@core/models/error-response.model';
import { SampleDetailDto } from './sample.dto';

export interface SampleState {
  items: SampleDetailDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortBy: string;
  ascending: 'ASC' | 'DESC';
  loading: boolean;
  error: ErrorResponse | null;
  selectedSample: SampleDetailDto | null;
  viewModalVisible: boolean;
  editModalVisible: boolean;
  editModalMode: 'add' | 'edit';
  editingSample: SampleDetailDto | null;
  modalIsLoading: boolean;
  modalOperation: 'create' | 'update' | null;
  modalError: ErrorResponse | null;
}

export const INITIAL_STATE_SAMPLE: SampleState = {
  items: [],
  total: 0,
  pageNumber: 1,
  pageSize: 10,
  searchTerm: '',
  sortBy: 'name',
  ascending: 'ASC',
  loading: false,
  error: null,
  selectedSample: null,
  viewModalVisible: false,
  editModalVisible: false,
  editModalMode: 'add',
  editingSample: null,
  modalIsLoading: false,
  modalOperation: null,
  modalError: null,
};
