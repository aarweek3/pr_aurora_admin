import { VersionStatus } from "./version-status.enum";

export interface ProgramOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  name?: string;
  localizedName?: string;
  shortDescription?: string;
  fullDescription?: string;
  pros?: string;
  cons?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProgramOfAggregatorItem {
  id: number;
  canonicalName: string;
  slug: string;
  iconPath?: string;
  categoryName?: string;
  developerName?: string;
  totalDownloads: number;
  averageRating: number;
  versionsCount: number;
  status: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  localizedName?: string;
}

export interface ProgramOfAggregatorDetail {
  id: number;
  categoryOfAggregatorId: number;
  subCategoryOfAggregatorId?: number;
  developerOfAggregatorId: number;
  canonicalName: string;
  slug: string;
  iconPath?: string;
  website?: string;
  status: number;
  sortOrder: number;
  totalDownloads: number;
  averageRating: number;
  isActive: boolean;
  isDeleted: boolean;
  localizations: ProgramOfAggregatorLocalization[];
  platformIds: number[];
  tagIds: number[];
}

export interface ProgramOfAggregatorCreate {
  categoryOfAggregatorId: number;
  subCategoryOfAggregatorId?: number;
  developerOfAggregatorId: number;
  canonicalName: string;
  slug: string;
  iconPath?: string;
  website?: string;
  status: number;
  sortOrder: number;
  isActive: boolean;
  localizations: ProgramOfAggregatorLocalization[];
  platformIds: number[];
  tagIds: number[];
}

export interface ProgramOfAggregatorUpdate extends ProgramOfAggregatorCreate {
  id: number;
}

export interface VersionOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  languageName?: string;
  changelog?: string;
  description?: string;
}

export interface DownloadLinkOfAggregatorLocalization {
  languageOfAggregatorId: number;
  languageCode?: string;
  label: string;
}

export interface DownloadLinkOfAggregator {
  id: number;
  url: string;
  sourceId?: number;
  isExternal: boolean;
  sortOrder: number;
  localizations: DownloadLinkOfAggregatorLocalization[];
}

export interface VersionOfAggregatorItem {
  id: number;
  versionNumber: string;
  releasedAt?: string;
  isLatest: boolean;
  status: VersionStatus;
  downloadLinksCount: number;
}

export interface VersionOfAggregatorDetail {
  id: number;
  programOfAggregatorId: number;
  versionNumber: string;
  releasedAt?: string;
  isLatest: boolean;
  sortOrder: number;
  externalChangelogUrl?: string;
  status: VersionStatus;
  localizations: VersionOfAggregatorLocalization[];
  downloadLinks: DownloadLinkOfAggregator[];
}

export interface VersionOfAggregatorCreate {
  programOfAggregatorId: number;
  versionNumber: string;
  releasedAt?: string;
  isLatest: boolean;
  sortOrder: number;
  externalChangelogUrl?: string;
  status: VersionStatus;
  localizations: VersionOfAggregatorLocalization[];
}

export interface VersionOfAggregatorUpdate extends VersionOfAggregatorCreate {
  id: number;
}

export interface ProgramPrerequisites {
  languagesCount: number;
  categoriesCount: number;
  developersCount: number;
  platformsCount: number;
  tagsCount: number;
  isValid: boolean;
}

export interface ProgramOfAggregatorState {
  items: ProgramOfAggregatorItem[];
  total: number;
  loading: boolean;
  pageLoading: boolean;
  searchTerm: string;
  pageNumber: number;
  pageSize: number;
  languageId: number | null;
  categoryId: number | null;
  platformId: number | null;
  developerId: number | null;
  status: number | null;
  showDeleted: boolean;
  sortBy: string;
  sortDirection: number;
  editingItem: ProgramOfAggregatorDetail | null;
  viewItem: ProgramOfAggregatorDetail | null;
  deletingId: number | null;
  prerequisites: ProgramPrerequisites | null;
  languages: any[];
  error: any | null;
}

export const INITIAL_PROGRAM_STATE: ProgramOfAggregatorState = {
  items: [],
  total: 0,
  loading: false,
  pageLoading: false,
  searchTerm: '',
  pageNumber: 1,
  pageSize: 10,
  languageId: null,
  categoryId: null,
  platformId: null,
  developerId: null,
  status: null,
  showDeleted: false,
  sortBy: 'Id',
  sortDirection: 1, // Desc
  editingItem: null,
  viewItem: null,
  deletingId: null,
  prerequisites: null,
  languages: [],
  error: null
};
