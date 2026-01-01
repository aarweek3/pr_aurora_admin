import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://api.aurora-admin.com',

  api: {
    baseUrl: 'https://api.aurora-admin.com/v1',
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 500,
  },

  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: 3600,
    autoRefresh: true,
  },

  features: {
    enableDarkMode: true,
    enableDebugMode: false,
    enableErrorReporting: true,
    enableAnalytics: true,
    enableWebSockets: true,
    enableOfflineMode: true,
  },

  logging: {
    level: 'error',
    enableConsole: false,
    enableRemote: true,
    remoteUrl: 'https://logging.aurora-admin.com/api/logs',
  },

  errorHandling: {
    showDetailedErrors: false,
    reportToServer: true,
    serverErrorUrl: 'https://errors.aurora-admin.com/api/report',
  },

  ui: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    toastDuration: 5000,
    modalWidth: 600,
    tableScrollHeight: 600,
  },

  cache: {
    enabled: true,
    ttl: 600000,
    maxSize: 200,
  },

  external: {
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    sentryDsn: 'YOUR_SENTRY_DSN',
    mixpanelToken: 'YOUR_MIXPANEL_TOKEN',
  },
};
