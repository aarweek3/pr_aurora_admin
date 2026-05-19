export interface ScreenshotOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  title?: string;
  altText?: string;
}

export interface ScreenshotOfAggregator {
  id: number;
  filePath: string;
  sortOrder: number;
  languageOfAggregatorId?: number | null;
  platformOfAggregatorId?: number | null;
  versionOfAggregatorId?: number | null;
  tempGuid?: string | null;
  localizations: ScreenshotOfAggregatorLocalization[];
}

export interface ScreenshotOfAggregatorSync {
  id: number;
  filePath: string;
  sortOrder: number;
  languageOfAggregatorId?: number | null;
  platformOfAggregatorId?: number | null;
  versionOfAggregatorId?: number | null;
  localizations: ScreenshotOfAggregatorLocalization[];
}

export interface ScreenshotUploadResponse {
  fileName: string;
  relativePath: string;
  thumbnailPath: string;
  size: number;
  width: number;
  height: number;
}

export interface ScreenshotOfAggregatorPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number | null;
  sortBy?: string;
  sortDirection?: number;
  showDeleted?: boolean;
}

export interface ScreenshotOfAggregatorPagedResponse {
  items: ScreenshotOfAggregator[];
  total: number;
  pageNumber: number;
  pageSize: number;
}
