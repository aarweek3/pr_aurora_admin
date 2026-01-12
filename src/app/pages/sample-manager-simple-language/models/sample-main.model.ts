export interface SeoDataDto {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  urlSlug?: string;
  canonicalUrl?: string;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;

  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;

  imageUrl?: string;
  imageAltText?: string;
  imageCaption?: string;

  schemaType?: string;
  schemaJsonLd?: string;

  authorName?: string;
  publisherName?: string;
  publishedDate?: string;

  noIndex: boolean;
  noFollow: boolean;
  priority?: number;
  region?: string;
}

export interface SampleMainDescriptionDto {
  languageAppId: number;
  languageCode?: string;
  name: string;
  description?: string;
  seoData?: SeoDataDto;
}

export interface SampleMainItemDto {
  id: number;
  name: string;
  systemCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  localizedName?: string;
}

export interface SampleMainDetailDto extends SampleMainItemDto {
  descriptions: SampleMainDescriptionDto[];
}

export interface SampleMainCreateRequestDto {
  name: string;
  systemCode?: string;
  isActive: boolean;
  descriptions: SampleMainDescriptionDto[];
}

export interface SampleMainUpdateRequestDto extends SampleMainCreateRequestDto {
  id: number;
}

export interface SampleMainPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number;
  sortBy?: number | string; // Enum or string field name
  sortDirection?: number | string; // 0/1 or Asc/Desc
}

export interface SampleMainPagedResponse {
  items: SampleMainItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

// --- State Interface ---
export interface SampleMainState {
  items: SampleMainItemDto[];
  total: number;
  loading: boolean;

  // Filters
  searchTerm: string;
  languageId: number | null;
  pageNumber: number;
  pageSize: number;

  // Modal
  modalVisible: boolean;
  modalMode: 'add' | 'edit' | 'view';
  editingItem: SampleMainDetailDto | null;
  modalLoading: boolean;
  modalError: string | null;
}

export const INITIAL_SAMPLE_MAIN_STATE: SampleMainState = {
  items: [],
  total: 0,
  loading: false,

  searchTerm: '',
  languageId: null,
  pageNumber: 1,
  pageSize: 10,

  modalVisible: false,
  modalMode: 'add',
  editingItem: null,
  modalLoading: false,
  modalError: null,
};
