/**
 * BOLINGO Product Detail Page JavaScript
 * Handles single product display with ThriveCart integration
 */

(function() {
  'use strict';

  // ThriveCart placeholder URL to check against
  const PLACEHOLDER_URL = 'https://example.com/thrivecart-checkout-link';

  /**
   * Check if checkout URL is valid/available
   */
  function isCheckoutAvailable(url) {
    return url && url.trim() !== '' && url !== PLACEHOLDER_URL;
  }

  /**
   * Render product detail
   */
  function renderProduct(product) {
    const {
      name = 'Unnamed Product',
      description = '',
      price = 0,
      category_name = '',
      category_slug = '',
      image_url = '',
      thrivecart_checkout_url = '',
      sku = '',
      brand = '',
      features = [],
      specifications = {}
    } = product;

    const imageUrl = image_url || Templates.getPlaceholderImage('product');
    const featuresArray = Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []);
    const checkoutAvailable = isCheckoutAvailable(thrivecart_checkout_url);

    return `
      <div class="detail__grid">
        <div class="detail__main">
          <div class="detail__image">
            <img src="${Templates.escapeHtml(imageUrl)}" alt="${Templates.escapeHtml(name)}" loading="eager">
          </div>

          <div class="detail__content">
            ${description ? `
              <h2>Product Description</h2>
              <p>${Templates.escapeHtml(description)}</p>
            ` : ''}

            ${featuresArray.length > 0 ? `
              <h2>Features</h2>
              <ul>
                ${featuresArray.map(f => `<li>${Templates.escapeHtml(f)}</li>`).join('')}
              </ul>
            ` : ''}

            ${Object.keys(specifications).length > 0 ? `
              <h2>Specifications</h2>
              <div class="sidebar-card" style="margin-top: var(--space-4);">
                ${Object.entries(specifications).map(([key, value]) => `
                  <div class="sidebar-card__item">
                    <span class="sidebar-card__label">${Templates.escapeHtml(key)}</span>
                    <span class="sidebar-card__value">${Templates.escapeHtml(value)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <aside class="detail__sidebar">
          <!-- Purchase Card -->
          <div class="sidebar-card">
            <div class="product-detail__price">${Templates.formatPrice(price)}</div>

            <div class="product-detail__actions">
              ${checkoutAvailable ? `
                <a href="${Templates.escapeHtml(thrivecart_checkout_url)}"
                   class="btn btn--primary btn--full btn--lg"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Buy ${Templates.escapeHtml(name)} now">
                  Buy Now
                </a>
              ` : `
                <div class="coming-soon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-bottom: 8px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p><strong>Checkout Coming Soon</strong></p>
                  <p style="font-size: var(--text-xs); margin-top: 4px;">This product will be available for purchase shortly.</p>
                </div>
              `}
            </div>
          </div>

          <!-- Product Info Card -->
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">Product Details</h3>
            ${category_name ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">Category</span>
                <a href="/store-category.html?slug=${encodeURIComponent(category_slug)}" class="sidebar-card__value" style="color: var(--color-primary);">
                  ${Templates.escapeHtml(category_name)}
                </a>
              </div>
            ` : ''}
            ${sku ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">SKU</span>
                <span class="sidebar-card__value">${Templates.escapeHtml(sku)}</span>
              </div>
            ` : ''}
            ${brand ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">Brand</span>
                <span class="sidebar-card__value">${Templates.escapeHtml(brand)}</span>
              </div>
            ` : ''}
            <div class="sidebar-card__item">
              <span class="sidebar-card__label">Availability</span>
              <span class="sidebar-card__value" style="color: var(--color-success);">In Stock</span>
            </div>
          </div>

          <!-- Secure Checkout Notice -->
          <div class="sidebar-card" style="text-align: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-success)" style="margin-bottom: 8px;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <p class="text-small text-muted">Secure checkout powered by ThriveCart</p>
          </div>

          <!-- Back Button -->
          <div class="sidebar-card">
            <a href="/store.html" class="btn btn--ghost btn--full">
              &larr; Back to Store
            </a>
          </div>
        </aside>
      </div>
    `;
  }

  /**
   * Load product from API
   */
  async function loadProduct() {
    const slug = UI.getQueryParam('slug');
    const contentEl = document.getElementById('product-content');
    const titleEl = document.getElementById('product-title');
    const breadcrumbEl = document.getElementById('breadcrumb-product');

    if (!slug) {
      contentEl.innerHTML = Templates.errorState(
        'No Product Specified',
        'Please select a product from the store.'
      );
      titleEl.textContent = 'Product Not Found';
      return;
    }

    try {
      const response = await API.getStoreProduct(slug);
      const product = response.data || response.product || response;

      if (!product || !product.name) {
        throw new Error('Product not found');
      }

      // Update page content
      contentEl.innerHTML = renderProduct(product);
      contentEl.setAttribute('aria-busy', 'false');

      // Update page title and breadcrumb
      titleEl.textContent = product.name;
      breadcrumbEl.textContent = Templates.truncate(product.name, 30);

      // Update SEO
      UI.setPageMeta({
        title: product.name,
        description: product.description || `Buy ${product.name} - ${Templates.formatPrice(product.price)}`,
        ogTitle: product.name,
        ogDescription: product.description,
        ogImage: product.image_url,
        canonical: `https://bolingo.com/product.html?slug=${encodeURIComponent(slug)}`
      });

    } catch (error) {
      console.error('Error loading product:', error);
      contentEl.innerHTML = Templates.errorState(
        'Product Not Found',
        'The requested product could not be found.'
      );
      titleEl.textContent = 'Product Not Found';
    }
  }

  /**
   * Initialize page
   */
  function init() {
    loadProduct();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
