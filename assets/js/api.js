/**
 * BOLINGO API Module
 * Centralized API communication layer
 */

const API = (() => {
  // Base URL for all API requests
  const BASE_URL = 'https://script.google.com/macros/s/AKfycbxM9VoOA-Hch13zwC5A_uVllmVcO3pL_dbam1ITKjwp1h7ihz5b7kfwN7t82VAYCTlfng/exec';

  // Default timeout in milliseconds
  const DEFAULT_TIMEOUT = 30000;

  // Admin token storage key
  const TOKEN_KEY = 'bolingo_admin_token';

  /**
   * Get stored admin token
   */
  function getAdminToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Set admin token
   */
  function setAdminToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Check if admin token is set
   */
  function hasAdminToken() {
    return !!getAdminToken();
  }

  /**
   * Build URL with query parameters
   */
  function buildUrl(endpoint, params = {}) {
    const url = new URL(BASE_URL);
    url.searchParams.set('path', endpoint);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  /**
   * Fetch with timeout wrapper
   */
  async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Generic GET request
   */
  async function get(endpoint, params = {}) {
    const url = buildUrl(endpoint, params);

    try {
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw new Error(error.message || 'Failed to fetch data. Please try again later.');
    }
  }

  /**
   * Generic POST request (admin only)
   * Note: Uses query param for token due to Google Apps Script CORS limitations
   */
  async function post(endpoint, body = {}) {
    const token = getAdminToken();

    if (!token) {
      throw new Error('Admin token is required. Please set your token first.');
    }

    // Build URL with admin_token as query param (GAS CORS workaround)
    const url = new URL(BASE_URL);
    url.searchParams.set('path', endpoint);
    url.searchParams.set('admin_token', token);

    try {
      const response = await fetchWithTimeout(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'  // Avoid preflight
        },
        body: JSON.stringify(body)
      });

      // Google Apps Script returns 200 even for redirects, so we need to handle this
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // If response is HTML (redirect), try to extract error or throw generic error
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('API redirect error. Please check your Google Apps Script deployment.');
        }
        throw new Error('Invalid response from API');
      }

      if (!data.ok && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw new Error(error.message || 'Failed to submit data. Please try again later.');
    }
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async function checkHealth() {
    return get('/health');
  }

  // ============================================
  // BLOG ENDPOINTS
  // ============================================

  async function getBlogCategories() {
    return get('/blog/categories');
  }

  async function getBlogPosts(categorySlug = null) {
    const params = categorySlug ? { category_slug: categorySlug } : {};
    return get('/blog/posts', params);
  }

  async function getBlogPost(slug) {
    if (!slug) throw new Error('Post slug is required');
    return get('/blog/post', { slug });
  }

  async function createBlogCategory(data) {
    return post('/blog/category', data);
  }

  async function createBlogPost(data) {
    return post('/blog/post', data);
  }

  // ============================================
  // STORE ENDPOINTS
  // ============================================

  async function getStoreCategories() {
    return get('/store/categories');
  }

  async function getStoreProducts(categorySlug = null) {
    const params = categorySlug ? { category_slug: categorySlug } : {};
    return get('/store/products', params);
  }

  async function getStoreProduct(slug) {
    if (!slug) throw new Error('Product slug is required');
    return get('/store/product', { slug });
  }

  async function createStoreCategory(data) {
    return post('/store/category', data);
  }

  async function createStoreProduct(data) {
    return post('/store/product', data);
  }

  // ============================================
  // DIRECTORY ENDPOINTS
  // ============================================

  async function getDirectoryListings(filters = {}) {
    // Filter out empty values
    const params = {};
    if (filters.state) params.state = filters.state;
    if (filters.type) params.type = filters.type;
    if (filters.access) params.access = filters.access;
    if (filters.species) params.species = filters.species;
    if (filters.q) params.q = filters.q;

    return get('/directory/listings', params);
  }

  async function getDirectoryListing(slug) {
    if (!slug) throw new Error('Listing slug is required');
    return get('/directory/listing', { slug });
  }

  async function createDirectoryListing(data) {
    return post('/directory/listing', data);
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Token management
    getAdminToken,
    setAdminToken,
    hasAdminToken,

    // Health
    checkHealth,

    // Blog
    getBlogCategories,
    getBlogPosts,
    getBlogPost,
    createBlogCategory,
    createBlogPost,

    // Store
    getStoreCategories,
    getStoreProducts,
    getStoreProduct,
    createStoreCategory,
    createStoreProduct,

    // Directory
    getDirectoryListings,
    getDirectoryListing,
    createDirectoryListing
  };
})();

// Make API available globally
window.API = API;
