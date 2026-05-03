export const ARCHITECTURE_ENUM_CODE = `public enum RequirementArchitecture
{
    Any       = 0,  // не важно
    x86       = 1,  // 32-bit
    x64       = 2,  // 64-bit
    Arm64     = 3,  // Apple Silicon
    Universal = 4   // macOS Universal
}`;

export const OS_VERSION_MODEL_CODE = `[Table("platform_os_versions_of_aggregator")]
public class PlatformOsVersionOfAggregator : FullAuditableEntityOfAggregator
{
    public int PlatformOfAggregatorId { get; set; }
    [ForeignKey(nameof(PlatformOfAggregatorId))]
    public virtual PlatformOfAggregator PlatformOfAggregator { get; set; }

    [Required, MaxLength(20)]
    public string VersionCode { get; set; } // "10", "11", "14"

    [Required, MaxLength(100)]
    public string DisplayName { get; set; } // "Windows 10", "macOS Sonoma"

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}`;

export const SYSTEM_REQUIREMENT_MODEL_CODE = `[Table("system_requirements_of_aggregator")]
public class SystemRequirementOfAggregator : FullAuditableEntityOfAggregator
{
    public int VersionOfAggregatorId { get; set; }
    public int PlatformOfAggregatorId { get; set; }
    public RequirementArchitecture Architecture { get; set; }
    
    public int? MinOsVersionId { get; set; }
    public int? MaxOsVersionId { get; set; }

    public bool IsRecommended { get; set; }
    public int SortOrder { get; set; }

    public virtual ICollection<SystemRequirementOfAggregatorLocalization> Localizations { get; set; }
}`;

export const SYSR_LOCALIZATION_MODEL_CODE = `[Table("system_requirement_of_aggregator_localizations")]
public class SystemRequirementOfAggregatorLocalization : AuditableEntityOfAggregator
{
    public int SystemRequirementOfAggregatorId { get; set; }
    public int LanguageOfAggregatorId { get; set; }
    public string? AdditionalNotes { get; set; } // "Requires .NET 6, 4GB RAM"
}`;

export const PLATFORM_OS_SEED_JSON = `[
  {
    "platformCode": "windows",
    "versions": [
      { "code": "XP", "name": "Windows XP", "sort": 5 },
      { "code": "Vista", "name": "Windows Vista", "sort": 10 },
      { "code": "7", "name": "Windows 7", "sort": 20 },
      { "code": "8", "name": "Windows 8", "sort": 30 },
      { "code": "8.1", "name": "Windows 8.1", "sort": 35 },
      { "code": "10", "name": "Windows 10", "sort": 40 },
      { "code": "11", "name": "Windows 11", "sort": 50 },
      { "code": "Server", "name": "Windows Server", "sort": 60 }
    ]
  },
  {
    "platformCode": "macos",
    "versions": [
      { "code": "10.12", "name": "macOS Sierra", "sort": 10 },
      { "code": "10.13", "name": "macOS High Sierra", "sort": 20 },
      { "code": "10.14", "name": "macOS Mojave", "sort": 30 },
      { "code": "10.15", "name": "macOS Catalina", "sort": 40 },
      { "code": "11", "name": "macOS Big Sur", "sort": 50 },
      { "code": "12", "name": "macOS Monterey", "sort": 60 },
      { "code": "13", "name": "macOS Ventura", "sort": 70 },
      { "code": "14", "name": "macOS Sonoma", "sort": 80 },
      { "code": "15", "name": "macOS Sequoia", "sort": 90 }
    ]
  },
  {
    "platformCode": "android",
    "versions": [
      { "code": "5.0", "name": "Android 5.0 Lollipop", "sort": 10 },
      { "code": "6.0", "name": "Android 6.0 Marshmallow", "sort": 20 },
      { "code": "7.0", "name": "Android 7.0 Nougat", "sort": 30 },
      { "code": "8.0", "name": "Android 8.0 Oreo", "sort": 40 },
      { "code": "9.0", "name": "Android 9.0 Pie", "sort": 50 },
      { "code": "10", "name": "Android 10", "sort": 60 },
      { "code": "11", "name": "Android 11", "sort": 70 },
      { "code": "12", "name": "Android 12", "sort": 80 },
      { "code": "13", "name": "Android 13", "sort": 90 },
      { "code": "14", "name": "Android 14", "sort": 100 },
      { "code": "15", "name": "Android 15", "sort": 110 },
      { "code": "16", "name": "Android 16", "sort": 120 }
    ]
  },
  {
    "platformCode": "ios",
    "versions": [
      { "code": "12", "name": "iOS 12", "sort": 10 },
      { "code": "13", "name": "iOS 13", "sort": 20 },
      { "code": "14", "name": "iOS 14", "sort": 30 },
      { "code": "15", "name": "iOS 15", "sort": 40 },
      { "code": "16", "name": "iOS 16", "sort": 50 },
      { "code": "17", "name": "iOS 17", "sort": 60 },
      { "code": "18", "name": "iOS 18", "sort": 70 }
    ]
  }
]`;

export const VERSION_SPEC_EXAMPLE_DATA = [
    { platform: 'Windows', arch: 'x64', minOs: 'Windows 10', isRec: false, notes: 'Requires .NET 6' },
    { platform: 'Windows', arch: 'x86', minOs: 'Windows 7', isRec: false, notes: '' },
    { platform: 'macOS', arch: 'Arm64', minOs: 'macOS 11', isRec: false, notes: 'Apple M1/M2' },
    { platform: 'Android', arch: 'Any', minOs: 'Android 5.0', isRec: false, notes: '' },
];

export const SERVER_SEARCH_CODE = `if (!string.IsNullOrWhiteSpace(request.SearchTerm))
{
    var search = request.SearchTerm.ToLower();
    query = query.Where(x =>
        x.Name.ToLower().Contains(search) ||
        x.SystemCode.ToLower().Contains(search) ||
        x.Localizations.Any(l => l.Name.ToLower().Contains(search))
    );
}`;
