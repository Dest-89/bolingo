/**
 * BOLINGO Templates Module
 * Reusable HTML templates for cards and components
 */

const Templates = (() => {
  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Truncate text to specified length
   */
  function truncate(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Format date string
   */
  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format price
   */
  function formatPrice(price) {
    if (price === undefined || price === null) return '$0.00';
    const num = parseFloat(price);
    if (isNaN(num)) return '$0.00';
    return '$' + num.toFixed(2);
  }

  /**
   * Get placeholder image URL
   */
  function getPlaceholderImage(type = 'hunting') {
    const placeholders = {
      hunting: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=600&h=400&fit=crop',
      blog: 'https://images.unsplash.com/photo-1541704328070-20bf4601ae3e?w=600&h=400&fit=crop',
      product: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&h=400&fit=crop',
      listing: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop'
    };
    return placeholders[type] || placeholders.hunting;
  }

  /**
   * Directory Listing Card
   */
  function listingCard(listing) {
    const {
      slug = '',
      name = 'Unnamed Listing',
      description = '',
      type = '',
      access = '',
      state = '',
      city = '',
      species = [],
      image_url = ''
    } = listing || {};

    const imageUrl = image_url || getPlaceholderImage('listing');
    const speciesArray = Array.isArray(species) ? species : (species ? [species] : []);
    const location = [city, state].filter(Boolean).join(', ');

    return `
      <article class="card card--listing">
        <a href="listing.html?slug=${encodeURIComponent(slug)}" class="card__image" aria-label="View ${escapeHtml(name)}">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy">
          ${type ? `<span class="card__badge">${escapeHtml(type)}</span>` : ''}
        </a>
        <div class="card__content">
          <h3 class="card__title">
            <a href="listing.html?slug=${encodeURIComponent(slug)}">${escapeHtml(name)}</a>
          </h3>
          ${description ? `<p class="card__excerpt">${escapeHtml(truncate(description))}</p>` : ''}
          <div class="card__meta">
            ${location ? `<span class="card__meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${escapeHtml(location)}</span>` : ''}
            ${access ? `<span class="card__meta-item">${escapeHtml(access)}</span>` : ''}
          </div>
          ${speciesArray.length > 0 ? `
            <div class="card__tags">
              ${speciesArray.slice(0, 3).map(s => `<span class="card__tag">${escapeHtml(s)}</span>`).join('')}
              ${speciesArray.length > 3 ? `<span class="card__tag">+${speciesArray.length - 3} more</span>` : ''}
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  /**
   * Blog Post Card
   */
  function postCard(post) {
    const {
      slug = '',
      title = 'Untitled Post',
      excerpt = '',
      content = '',
      category_name = '',
      category_slug = '',
      author = '',
      published_at = '',
      image_url = ''
    } = post || {};

    const imageUrl = image_url || getPlaceholderImage('blog');
    const displayExcerpt = excerpt || truncate(content, 120);

    return `
      <article class="card card--post">
        <a href="post.html?slug=${encodeURIComponent(slug)}" class="card__image" aria-label="Read ${escapeHtml(title)}">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy">
        </a>
        <div class="card__content">
          ${category_name ? `
            <a href="blog-category.html?slug=${encodeURIComponent(category_slug)}" class="card__category">${escapeHtml(category_name)}</a>
          ` : ''}
          <h3 class="card__title">
            <a href="post.html?slug=${encodeURIComponent(slug)}">${escapeHtml(title)}</a>
          </h3>
          ${displayExcerpt ? `<p class="card__excerpt">${escapeHtml(displayExcerpt)}</p>` : ''}
          <div class="card__meta">
            ${author ? `<span class="card__meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>${escapeHtml(author)}</span>` : ''}
            ${published_at ? `<span class="card__meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>${formatDate(published_at)}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Product Card
   */
  function productCard(product) {
    const {
      slug = '',
      name = 'Unnamed Product',
      description = '',
      price = 0,
      category_name = '',
      category_slug = '',
      image_url = '',
      thrivecart_checkout_url = ''
    } = product || {};

    const imageUrl = image_url || getPlaceholderImage('product');
    const isCheckoutAvailable = thrivecart_checkout_url &&
      thrivecart_checkout_url !== '' &&
      thrivecart_checkout_url !== 'https://example.com/thrivecart-checkout-link';

    return `
      <article class="card card--product">
        <a href="product.html?slug=${encodeURIComponent(slug)}" class="card__image" aria-label="View ${escapeHtml(name)}">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy">
        </a>
        <div class="card__content">
          ${category_name ? `
            <a href="store-category.html?slug=${encodeURIComponent(category_slug)}" class="card__category">${escapeHtml(category_name)}</a>
          ` : ''}
          <h3 class="card__title">
            <a href="product.html?slug=${encodeURIComponent(slug)}">${escapeHtml(name)}</a>
          </h3>
          ${description ? `<p class="card__excerpt">${escapeHtml(truncate(description, 80))}</p>` : ''}
          <div class="card__price">${formatPrice(price)}</div>
          <div class="card__actions">
            <a href="product.html?slug=${encodeURIComponent(slug)}" class="btn btn--outline btn--sm">View Details</a>
            ${isCheckoutAvailable
              ? `<a href="${escapeHtml(thrivecart_checkout_url)}" class="btn btn--primary btn--sm" target="_blank" rel="noopener noreferrer">Buy Now</a>`
              : `<span class="btn btn--disabled btn--sm">Coming Soon</span>`
            }
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Category Tab/Button
   */
  function categoryTab(category, activeSlug = '', baseUrl = '') {
    const { slug = '', name = 'Category' } = category || {};
    const isActive = slug === activeSlug;

    return `
      <a href="${baseUrl}?slug=${encodeURIComponent(slug)}"
         class="category-tab ${isActive ? 'active' : ''}"
         ${isActive ? 'aria-current="page"' : ''}>
        ${escapeHtml(name)}
      </a>
    `;
  }

  /**
   * Loading skeleton for card
   */
  function cardSkeleton() {
    return `
      <div class="card skeleton--card">
        <div class="skeleton skeleton--image"></div>
        <div class="card__content">
          <div class="skeleton skeleton--text" style="width: 30%;"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text" style="width: 80%;"></div>
        </div>
      </div>
    `;
  }

  /**
   * Grid of loading skeletons
   */
  function loadingGrid(count = 6) {
    return `<div class="grid grid--3">${Array(count).fill(cardSkeleton()).join('')}</div>`;
  }

  /**
   * Empty state
   */
  function emptyState(title = 'No Results', message = 'Nothing found.', showButton = false, buttonText = '', buttonUrl = '') {
    return `
      <div class="empty-state">
        <svg class="empty-state__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <h3 class="empty-state__title">${escapeHtml(title)}</h3>
        <p class="empty-state__text">${escapeHtml(message)}</p>
        ${showButton ? `<a href="${escapeHtml(buttonUrl)}" class="btn btn--primary">${escapeHtml(buttonText)}</a>` : ''}
      </div>
    `;
  }

  /**
   * Error state
   */
  function errorState(title = 'Something went wrong', message = 'Unable to load data. Please try again later.') {
    return `
      <div class="error-state">
        <h3 class="error-state__title">${escapeHtml(title)}</h3>
        <p class="error-state__text">${escapeHtml(message)}</p>
        <button class="btn btn--outline" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }

  /**
   * Loading indicator
   */
  function loading(text = 'Loading...') {
    return `
      <div class="loading" role="status" aria-live="polite">
        <div class="loading__spinner"></div>
        <span class="loading__text">${escapeHtml(text)}</span>
      </div>
    `;
  }

  /**
   * Success message
   */
  function successMessage(message) {
    return `
      <div class="success-message" role="alert">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 8px;">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        ${escapeHtml(message)}
      </div>
    `;
  }

  /**
   * Option element for select
   */
  function selectOption(value, label, selected = false) {
    return `<option value="${escapeHtml(value)}" ${selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }

  // Public API
  return {
    escapeHtml,
    truncate,
    formatDate,
    formatPrice,
    getPlaceholderImage,
    listingCard,
    postCard,
    productCard,
    categoryTab,
    cardSkeleton,
    loadingGrid,
    emptyState,
    errorState,
    loading,
    successMessage,
    selectOption
  };
})();

// Make Templates available globally
window.Templates = Templates;
