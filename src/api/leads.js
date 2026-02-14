import apiClient from './client.js';

/**
 * Submit a general website lead.
 * @param {Object} payload
 */
export const submitGeneralLead = async (payload) => {
  return apiClient.request('/api/v1/leads/general', {
    method: 'POST',
    body: payload
  });
};

/**
 * Submit a property-specific listing lead.
 * @param {Object} payload
 */
export const submitListingLead = async (payload) => {
  return apiClient.request('/api/v1/leads/listing', {
    method: 'POST',
    body: payload
  });
};

const leadsApi = { submitGeneralLead, submitListingLead };
export default leadsApi;
