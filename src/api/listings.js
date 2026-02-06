import apiClient from './client.js';
import { buildQuery, mergeParamsWithDefaults } from './utils.js';

const DEFAULT_LISTING_FILTERS = {
  type: 'SELL',
  page: 1,
  size: 12,
  fetchAll: false
};

/**
 * Fetch listings with filters.
 * @param {Object} filters
 */
export const getListings = async (filters = {}) => {
  const params = mergeParamsWithDefaults(DEFAULT_LISTING_FILTERS, filters);
  const query = buildQuery(params);
  return apiClient.request(`/api/v1/listings${query}`, { method: 'GET' });
};

/**
 * Fetch property detail by slug.
 * @param {string} slug
 */
export const getPropertyDetail = async (slug) => {
  return apiClient.request(`/api/v1/properties/${encodeURIComponent(slug)}`, { method: 'GET' });
};

const listingsApi = { getListings, getPropertyDetail };
export default listingsApi;
