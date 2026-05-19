/**
 * Тип установщика для Windows
 */
export enum WindowsInstallerType {
  MSI = 0,
  EXE = 1,
  MSIX = 2,
  Portable = 3,
  Winget = 4,
  Store = 5
}

/**
 * Тип установщика для macOS
 */
export enum MacInstallerType {
  DMG = 0,
  PKG = 1,
  ZIP = 2,
  Homebrew = 3,
  AppStore = 4
}

/**
 * Поддерживаемые форматы пакетов для Linux (битовая маска)
 */
export enum LinuxPackageFormat {
  None = 0,
  DEB = 1,
  RPM = 2,
  AppImage = 4,
  Flatpak = 8,
  Snap = 16,
  Tarball = 32
}

/**
 * Возрастной рейтинг для Android (Google Play)
 */
export enum AgeRatingAndroid {
  Everyone = 0,
  Everyone10Plus = 1,
  Teen = 2,
  Mature17Plus = 3
}

/**
 * Возрастной рейтинг для iOS (App Store)
 */
export enum AgeRatingIos {
  Rating4Plus = 0,
  Rating9Plus = 1,
  Rating12Plus = 2,
  Rating17Plus = 3
}

/**
 * Базовый интерфейс технических характеристик ПО
 */
export interface BaseTechSpecDto {
  id: number;
  versionId: number;

  // --- Финансовые условия ---
  licenseTypeId?: number | null;
  price?: number | null;
  currency?: string | null;

  // --- Характеристики файлов ---
  fileSizeMb?: number | null;
  installedSizeMb?: number | null;
  architecture?: string | null; // Хранится как JSON-строка (например, '["x64", "ARM64"]')

  // --- Функциональные возможности ---
  isPortable: boolean;
  hasAutoUpdate: boolean;
  isOpenSource: boolean;
  sourceCodeUrl?: string | null;
  requiresInternet: boolean;
  supportsOffline: boolean;
  inAppPurchases: boolean;
  supportedLanguages?: string | null; // Хранится как JSON-строка (например, '["en", "ru"]')
}

/**
 * Технические характеристики для Windows
 */
export interface WindowsTechSpecDto extends BaseTechSpecDto {
  minOsVersionId?: number | null;
  minOsVersionName?: string; // Удобное имя ОС для вывода в UI
  minRamMb?: number | null;
  minDiskMb?: number | null;
  minCpu?: string | null;

  requiresDotNet?: string | null;
  requiresVcRedist: boolean;
  requiresDirectX?: string | null;
  requiresAdminRights: boolean;

  supportsSilentInstall: boolean;
  supportsHighDpi: boolean;
  supportsTouchscreen: boolean;

  // --- Расширенная дистрибуция ---
  installerType: WindowsInstallerType;
  wingetId?: string | null;
  chocolateyId?: string | null;
  scoopBucket?: string | null;

  // --- Microsoft Store ---
  hasWindowsStore: boolean;
  storeId?: string | null;
  storeUrl?: string | null;
}

/**
 * Технические характеристики для macOS
 */
export interface MacOsTechSpecDto extends BaseTechSpecDto {
  minOsVersionId?: number | null;
  minOsVersionName?: string;
  minRamMb?: number | null;
  minDiskMb?: number | null;

  // --- Поддержка архитектур Apple ---
  supportsAppleSilicon: boolean;
  supportsIntel: boolean;
  isUniversalBinary: boolean;
  requiresRosetta: boolean;

  // --- Безопасность и интеграция ---
  isSandboxed: boolean;
  isNotarized: boolean;

  // --- Дистрибуция ---
  installerType: MacInstallerType;
  homebrewCask?: string | null;

  // --- Mac App Store ---
  hasAppStore: boolean;
  appStoreId?: string | null;
  appStoreUrl?: string | null;
}

/**
 * Технические характеристики для Linux
 */
export interface LinuxTechSpecDto extends BaseTechSpecDto {
  minRamMb?: number | null;
  minDiskMb?: number | null;

  supportedDistributions?: string | null; // JSON-строка (например, '["Ubuntu", "Fedora"]')
  desktopEnvironments?: string | null; // JSON-строка (например, '["GNOME", "KDE"]')
  dependencies?: string | null; // JSON-строка (например, '["libssl", "glibc"]')

  // --- Дисплейный сервер ---
  supportsWayland: boolean;
  requiresX11: boolean;

  // --- Пакеты и дистрибуция ---
  packageFormats: LinuxPackageFormat;
  flatpakId?: string | null;
  snapName?: string | null;
  debUrl?: string | null;
  rpmUrl?: string | null;
  appImageUrl?: string | null;
}

/**
 * Технические характеристики для Android
 */
export interface AndroidTechSpecDto extends BaseTechSpecDto {
  minOsVersionId?: number | null;
  minOsVersionName?: string;
  minSdkVersion?: number | null;
  targetSdkVersion?: number | null;

  // --- Google Play данные ---
  googlePlayId?: string | null;
  googlePlayUrl?: string | null;
  ageRating: AgeRatingAndroid;

  // --- Прямая дистрибуция (APK) ---
  hasApkDownload: boolean;
  apkUrl?: string | null;

  // --- Поддержка устройств ---
  supportsAndroidTv: boolean;
  supportsWearOs: boolean;
  supportsChromebook: boolean;
  supportsFoldable: boolean;

  // --- Особенности платформы ---
  requiresGoogleServices: boolean;
  hasAdaptiveIcon: boolean;
  permissionsRequired?: string | null; // JSON-строка (например, '["CAMERA", "RECORD_AUDIO"]')
}

/**
 * Технические характеристики для iOS / iPadOS
 */
export interface IosTechSpecDto extends BaseTechSpecDto {
  minOsVersionId?: number | null;
  minOsVersionName?: string;

  // --- Поддержка устройств ---
  supportsIphone: boolean;
  supportsIpad: boolean;
  supportsAppleWatch: boolean;
  supportsMacCatalyst: boolean;
  supportsAppleTv: boolean;

  // --- App Store данные ---
  appStoreId?: string | null;
  appStoreUrl?: string | null;
  ageRating: AgeRatingIos;

  // --- Функциональные возможности iOS ---
  hasWidgets: boolean;
  hasSiriIntegration: boolean;
  hasICloudSync: boolean;
  hasFamilySharing: boolean;
  hasLiveActivities: boolean;
  hasShareExtension: boolean;
  permissionsRequired?: string | null; // JSON-строка (например, '["camera", "microphone"]')
}
