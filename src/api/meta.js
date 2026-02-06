import apiClient from './client.js';
import { buildQuery, mergeParamsWithDefaults } from './utils.js';

const DEFAULT_META_PAGINATION = { page: 1, size: 50 };
const MAX_META_PAGE_SIZE = 200;

const memo = new Map();
const MEMO_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getMemoKey = (path, params) => `${path}${buildQuery(params)}`;

const memoizedGet = async (path, params = {}) => {
  const key = getMemoKey(path, params);
  const hit = memo.get(key);
  if (hit && Date.now() - hit.time < MEMO_TTL_MS) {
    return hit.data;
  }
  const data = await apiClient.request(`${path}${buildQuery(params)}`, { method: 'GET' });
  memo.set(key, { data, time: Date.now() });
  return data;
};

const normalizeMetaParams = (params = {}) => {
  const merged = mergeParamsWithDefaults(DEFAULT_META_PAGINATION, params);
  const page = Number(merged.page);
  const size = Number(merged.size);

  return {
    ...merged,
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_META_PAGINATION.page,
    // Backend validation caps at 200; clamp here to avoid 400s.
    size: Number.isFinite(size)
      ? Math.min(MAX_META_PAGE_SIZE, Math.max(1, size))
      : DEFAULT_META_PAGINATION.size
  };
};

export const getDevelopers = async (params = {}) => {
  return memoizedGet('/api/v1/meta/developers', normalizeMetaParams(params));
};

export const getAmenities = async () => memoizedGet('/api/v1/meta/amenities');

export const getLocations = async (params = {}) => {
  return memoizedGet('/api/v1/meta/locations', normalizeMetaParams(params));
};

export default { getDevelopers, getAmenities, getLocations };
