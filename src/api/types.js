/**
 * @typedef {Object} Listing
 * @property {string} slug
 * @property {string} id
 * @property {string} title
 * @property {'NEW'|'SELL'|'RENT'} type
 * @property {number} [priceAED]
 * @property {string} [status]
 * @property {string} [location]
 * @property {string} [city]
 * @property {string} [community]
 * @property {number} [beds]
 * @property {number} [baths]
 * @property {number} [size]
 * @property {string} [developer]
 * @property {{ name?: string; phone?: string; email?: string }} [agent]
 * @property {string[]} gallery
 * @property {string} [coverImage]
 * @property {string[]} [amenities]
 */

/**
 * @typedef {Object} ListingResponse
 * @property {number} total
 * @property {number} [totalAvailable]
 * @property {{ property: Listing; raw: any }[]} list
 */

/**
 * @typedef {Object} Developer
 * @property {number|string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Amenity
 * @property {number|string} id
 * @property {string} name
 */

/**
 * @typedef {Object} LocationItem
 * @property {number|string} id
 * @property {string} name
 * @property {string} [type] // city/region/community
 */
