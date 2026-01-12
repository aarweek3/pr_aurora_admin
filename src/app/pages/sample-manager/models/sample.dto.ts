// sample.dto.ts
export interface SampleCreateRequestDto {
  name: string;
  description?: string;
}

export interface SampleUpdateRequestDto {
  id: number;
  name: string;
  description?: string;
}

export interface SampleDetailDto {
  id: number;
  name: string;
  description?: string;
}

export interface SamplePageRequestDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface SamplePagedResponseDto {
  items: SampleDetailDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}
