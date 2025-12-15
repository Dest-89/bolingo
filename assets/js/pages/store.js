/**
 * BOLINGO Store Page JavaScript
 * Handles products listing and category filtering
 */

(function() {
  'use strict';

  // DOM Elements
  let productsGrid;
  let resultsInfo;
  let categoryTabs;

  /**
   * Load store categories
   */
  async function loadCategories() {
    if (!categoryTabs) return;

    try {
      const response = await API.getStoreCategories();
      const categories = response.data || response.categories || response || [];

      if (!Array.isArray(categories) || categories.length === 0) {
        return;
      }

      // Add category tabs
      const tabsHtml = categories.map(cat => {
        return `<a href="/store-category.html?slug=${encodeURIComponent(cat.slug)}" class="category-tab">${Templates.escapeHtml(cat.name)}</a>`;
      }).join('');

      categoryTabs.innerHTML = `
        <a href="/store.html" class="category-tab active" aria-current="page">All Products</a>
        ${tabsHtml}
      `;

    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  /**
   * Load products
   */
  async function loadProducts() {
    if (!productsGrid) return;

    productsGrid.innerHTML = Templates.loadingGrid(6);
    productsGrid.setAttribute('aria-busy', 'true');
    resultsInfo.textContent = 'Loading products...';

    try {
      const response = await API.getStoreProducts();
      let products = response.data || response.products || response || [];

      if (!Array.isArray(products)) {
        products = [];
      }

      renderProducts(products);

    } catch (error) {
      console.error('Error loading products:', error);
      productsGrid.innerHTML = Templates.errorState(
        'Unable to Load Products',
        error.message || 'Please try again later.'
      );
      resultsInfo.textContent = 'Error loading products';
    } finally {
      productsGrid.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Render products to grid
   */
  function renderProducts(products) {
    if (!productsGrid) return;

    if (products.length === 0) {
      productsGrid.innerHTML = Templates.emptyState(
        'No Products Yet',
        'Check back soon for quality hunting gear.',
        false
      );
      resultsInfo.textContent = 'No products found';
      return;
    }

    productsGrid.innerHTML = products.map(Templates.productCard).join('');
    resultsInfo.textContent = UI.pluralize(products.length, 'product') + ' available';
  }

  /**
   * Initialize page
   */
  function init() {
    // Get DOM elements
    productsGrid = document.getElementById('products-grid');
    resultsInfo = document.getElementById('results-info');
    categoryTabs = document.getElementById('category-tabs');

    // Load content
    loadCategories();
    loadProducts();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
