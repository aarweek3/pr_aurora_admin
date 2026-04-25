export const CATEGORY_TAG_OF_AGGREGATOR_ENDPOINTS = {
  GET_PAGED: 'api/v1/aggregator/category-tags',
  GET_BY_ID: (id: number) => `api/v1/aggregator/category-tags/${id}`,
  CREATE: 'api/v1/aggregator/category-tags',
  UPDATE: (id: number) => `api/v1/aggregator/category-tags/${id}`,
  DELETE: (id: number) => `api/v1/aggregator/category-tags/${id}`,
  RESTORE: (id: number) => `api/v1/aggregator/category-tags/${id}/restore`,
  SEED: 'api/v1/aggregator/category-tags/maintenance/seed',
  CLEAR: 'api/v1/aggregator/category-tags/maintenance/clear',
};
