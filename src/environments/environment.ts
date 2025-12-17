import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,

  api: {
    baseUrl: 'https://localhost:7233/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: 3600, // 1 hour
    autoRefresh: true,
  },

  features: {
    enableDarkMode: true,
    enableDebugMode: true,
    enableErrorReporting: false,
    enableAnalytics: false,
    enableWebSockets: false,
    enableOfflineMode: false,
  },

  logging: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
    remoteUrl: 'http://localhost:3000/logs',
  },

  errorHandling: {
    showDetailedErrors: true,
    reportToServer: false,
    serverErrorUrl: 'http://localhost:3000/errors',
  },

  ui: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    toastDuration: 5000,
    modalWidth: 600,
    tableScrollHeight: 600,
  },

  cache: {
    enabled: false,
    ttl: 600000, // 10 minutes
    maxSize: 100,
  },

  external: {
    googleMapsApiKey: '',
    sentryDsn: '',
    mixpanelToken: '',
  },
};
