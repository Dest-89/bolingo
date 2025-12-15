/**
 * BOLINGO Store Category Page JavaScript
 * Handles filtered products by category
 */

(function() {
  'use strict';

  // DOM Elements
  let productsGrid;
  let resultsInfo;
  let categoryTabs;
  let categoryTitle;
  let breadcrumbCategory;

  // Current category slug
  let currentSlug;

  /**
   * Load store categories and set active tab
   */
  async function loadCategories() {
    if (!categoryTabs) return;

    try {
      const response = await API.getStoreCategories();
      const categories = response.data || response.categories || response || [];

      if (!Array.isArray(categories) || categories.length === 0) {
        return;
      }

      // Find current category
      const currentCategory = categories.find(c => c.slug === currentSlug);
      if (currentCategory) {
        categoryTitle.textContent = currentCategory.name;
        breadcrumbCategory.textContent = currentCategory.name;

        // Update SEO
        UI.setPageMeta({
          title: `${currentCategory.name} | Store`,
          description: currentCategory.description || `Browse ${currentCategory.name} hunting gear.`,
          canonical: `https://bolingo.com/store-category.html?slug=${encodeURIComponent(currentSlug)}`
        });
      }

      // Render category tabs
      const tabsHtml = categories.map(cat => {
        const isActive = cat.slug === currentSlug;
        return `<a href="/store-category.html?slug=${encodeURIComponent(cat.slug)}" class="category-tab ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>${Templates.escapeHtml(cat.name)}</a>`;
      }).join('');

      categoryTabs.innerHTML = `
        <a href="/store.html" class="category-tab">All Products</a>
        ${tabsHtml}
      `;

    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  /**
   * Load products by category
   */
  async function loadProducts() {
    if (!productsGrid) return;

    productsGrid.innerHTML = Templates.loadingGrid(6);
    productsGrid.setAttribute('aria-busy', 'true');
    resultsInfo.textContent = 'Loading products...';

    try {
      const response = await API.getStoreProducts(currentSlug);
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
        'No Products in This Category',
        'Check back soon or browse other categories.',
        true,
        'View All Products',
        '/store.html'
      );
      resultsInfo.textContent = 'No products found in this category';
      return;
    }

    productsGrid.innerHTML = products.map(Templates.productCard).join('');
    resultsInfo.textContent = UI.pluralize(products.length, 'product') + ' available';
  }

  /**
   * Initialize page
   */
  function init() {
    // Get slug from URL
    currentSlug = UI.getQueryParam('slug');

    if (!currentSlug) {
      // Redirect to main store if no slug
      window.location.href = '/store.html';
      return;
    }

    // Get DOM elements
    productsGrid = document.getElementById('products-grid');
    resultsInfo = document.getElementById('results-info');
    categoryTabs = document.getElementById('category-tabs');
    categoryTitle = document.getElementById('category-title');
    breadcrumbCategory = document.getElementById('breadcrumb-category');

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
