export const TAG_OF_AGGREGATOR_ENDPOINTS = {
  GET_PAGED: 'api/v1/aggregator/tags',
  GET_BY_ID: (id: number) => `api/v1/aggregator/tags/${id}`,
  CREATE: 'api/v1/aggregator/tags',
  UPDATE: (id: number) => `api/v1/aggregator/tags/${id}`,
  DELETE: (id: number) => `api/v1/aggregator/tags/${id}`,
  RESTORE: (id: number) => `api/v1/aggregator/tags/${id}/restore`,
  UPDATE_SORT_ORDER: (id: number) => `api/v1/aggregator/tags/${id}/sort-order`,
  SEED: 'api/v1/aggregator/tags/maintenance/seed',
  CLEAR: 'api/v1/aggregator/tags/maintenance/clear',
};
