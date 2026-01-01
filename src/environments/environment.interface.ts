export interface Environment {
  production: boolean;
  apiUrl: string;

  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
    autoRefresh: boolean;
  };

  features: {
    enableDarkMode: boolean;
    enableDebugMode: boolean;
    enableErrorReporting: boolean;
    enableAnalytics: boolean;
    enableWebSockets: boolean;
    enableOfflineMode: boolean;
  };

  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsole: boolean;
    enableRemote: boolean;
    remoteUrl: string;
  };

  errorHandling: {
    showDetailedErrors: boolean;
    reportToServer: boolean;
    serverErrorUrl: string;
  };

  ui: {
    defaultPageSize: number;
    pageSizeOptions: number[];
    toastDuration: number;
    modalWidth: number;
    tableScrollHeight: number;
  };

  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };

  external: {
    googleMapsApiKey: string;
    sentryDsn: string;
    mixpanelToken: string;
  };
}
