// src/app/constants/constants.ts

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      CHANGE_PASSWORD: '/api/auth/change-password',
      PROFILE: '/api/auth/profile'
    },
    USERS: {
      BASE: '/api/users',
      BY_ID: (id: string) => `/api/users/${id}`,
      BY_EMAIL: (email: string) => `/api/users/by-email/${email}`,
      ACTIVATE: (id: string) => `/api/users/${id}/activate`,
      DEACTIVATE: (id: string) => `/api/users/${id}/deactivate`,
      STATISTICS: '/api/users/statistics',
      SEARCH: '/api/users/search'
    },
    SESSIONS: {
      BASE: '/api/sessions',
      BY_TOKEN: (token: string) => `/api/sessions/${token}`,
      REVOKE: (id: number) => `/api/sessions/${id}/revoke`,
      REVOKE_ALL: '/api/sessions/revoke-all',
      UPDATE: (id: number) => `/api/sessions/${id}`,
      CLEANUP: '/api/sessions/cleanup',
      VALIDATE: (token: string) => `/api/sessions/${token}/validate`
    },
    ACTIVITY_LOGS: {
      BASE: '/api/activitylogs',
      BY_ID: (id: number) => `/api/activitylogs/${id}`,
      BY_USER: (userId: string) => `/api/activitylogs/user/${userId}`,
      MY: '/api/activitylogs/my',
      RECENT: '/api/activitylogs/recent',
      STATISTICS: '/api/activitylogs/statistics',
      CLEANUP: '/api/activitylogs/cleanup'
    },
    ADMIN: {
      USERS: '/api/admin-panel/users',
      USER_BY_ID: (id: string) => `/api/admin-panel/users/${id}`,
      USER_ACTIVATE: (id: string) => `/api/admin-panel/users/${id}/activate`,
      USER_DEACTIVATE: (id: string) => `/api/admin-panel/users/${id}/deactivate`,
      USER_CHANGE_PASSWORD: (id: string) => `/api/admin-panel/users/${id}/change-password`,
      USER_SESSIONS: (id: string) => `/api/admin-panel/users/${id}/sessions`,
      USER_SESSIONS_REVOKE_ALL: (id: string) => `/api/admin-panel/users/${id}/sessions/revoke-all`,
      USER_ACTIVITY_LOGS: (id: string) => `/api/admin-panel/users/${id}/activity-logs`,
      SESSIONS: '/api/admin-panel/sessions',
      SESSION_REVOKE: (id: number) => `/api/admin-panel/sessions/${id}/revoke`,
      ACTIVITY_LOGS: '/api/admin-panel/activity-logs',
      STATISTICS: '/api/admin-panel/statistics'
    }
  }
};



export const PAGINATION_DEFAULTS = {
  PAGE_NUMBER: 1,
  PAGE_SIZE: 20
};