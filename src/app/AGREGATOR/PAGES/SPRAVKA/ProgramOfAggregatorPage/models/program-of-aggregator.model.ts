import { VersionStatus } from './version-status.enum';
import { WindowsTechSpecDto, MacOsTechSpecDto, LinuxTechSpecDto, AndroidTechSpecDto, IosTechSpecDto } from '../../../TechSpec/tech-spec.model';
import { LanguageAggregator } from '../../LanguageOfAggregator/models/language-aggregator.model';
import { DeveloperOfAggregatorItem } from '../../DeveloperOfAggregatorPage/models/developer-of-aggregator.model';
import { PlatformOfAggregatorItemDto } from '../../PlatformOfAggregatorPage/models/platform-of-aggregator.model';
import { ErrorResponse } from '@core/models/error-response.model';

export interface CategoryTreeNode {
  title: string;
  key: string;
  isLeaf: boolean;
  children: CategoryTreeNode[];
}

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
  licenseType?: string;
  licenseTypeId?: number;
  metaTitle?: string;
  metaDescription?: string;
  youtubeVideoUrl?: string;
  customVideoUrl?: string;
}

export interface ProgramOfAggregatorItem {
  id: number;
  canonicalName: string;
  slug: string;
  iconPath?: string;
  categoryName?: string;
  simplifiedCategoryName?: string;
  simplifiedSubcategoryName?: string;
  mainPlatformName?: string;
  mainPlatformId?: number;
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
  categoryId?: number;
  subcategoryId?: number;
  simplifiedCategoryName?: string;
  simplifiedSubcategoryName?: string;
  developerOfAggregatorId: number;
  canonicalName: string;
  slug: string;
  mainPlatformId: number;
  iconPath?: string;
  website?: string;
  youtubeVideoUrl?: string;
  customVideoUrl?: string;
  status: number;
  sortOrder: number;
  totalDownloads: number;
  averageRating: number;
  isActive: boolean;
  isDeleted: boolean;
  localizations: ProgramOfAggregatorLocalization[];
  platformIds: number[];
  tagIds: number[];
  tags: TagInfo[];
  screenshots: ScreenshotOfAggregator[];
  versions: VersionOfAggregatorDetail[];
  createdAt: string;
  updatedAt?: string;
}

export interface TagInfo {
  id: number;
  name: string;
  systemCode: string;
  color?: string;
  categoryName?: string;
  isFeature: boolean;
}

export interface ScreenshotOfAggregator {
  id: number;
  filePath: string;
  sortOrder: number;
  languageOfAggregatorId?: number;
}

export interface ProgramOfAggregatorCreate {
  categoryOfAggregatorId: number;
  categoryId?: number;
  subcategoryId?: number;
  developerOfAggregatorId: number;
  canonicalName: string;
  slug: string;
  mainPlatformId: number;
  iconPath?: string;
  website?: string;
  youtubeVideoUrl?: string;
  customVideoUrl?: string;
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

  // --- TechSpecs v2 ---
  windowsSpec?: WindowsTechSpecDto | null;
  macOsSpec?: MacOsTechSpecDto | null;
  iosSpec?: IosTechSpecDto | null;
  androidSpec?: AndroidTechSpecDto | null;
  linuxSpec?: LinuxTechSpecDto | null;
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

  // --- TechSpecs v2 ---
  windowsSpec?: WindowsTechSpecDto | null;
  macOsSpec?: MacOsTechSpecDto | null;
  iosSpec?: IosTechSpecDto | null;
  androidSpec?: AndroidTechSpecDto | null;
  linuxSpec?: LinuxTechSpecDto | null;
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
  viewModalVisible: boolean;
  viewModalMaximized: boolean;
  deletingId: number | null;
  prerequisites: ProgramPrerequisites | null;
  languages: LanguageAggregator[];
  categories: CategoryTreeNode[];
  developers: DeveloperOfAggregatorItem[];
  platforms: PlatformOfAggregatorItemDto[];
  error: ErrorResponse | null;
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
  viewModalVisible: false,
  viewModalMaximized: false,
  deletingId: null,
  prerequisites: null,
  languages: [],
  categories: [],
  developers: [],
  platforms: [],
  error: null,
};

export interface ProgramOfAggregatorPageRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  languageId?: number | null;
  categoryId?: number | null;
  platformId?: number | null;
  developerId?: number | null;
  status?: number | null;
  sortBy?: string;
  sortDirection?: number;
  showDeleted?: boolean;
}

export interface ProgramOfAggregatorPagedResponse {
  items: ProgramOfAggregatorItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
}
