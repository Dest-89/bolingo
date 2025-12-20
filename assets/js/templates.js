/**
 * BOLINGO Templates Module
 * Reusable HTML templates for cards and components
 */

const Templates = (() => {
  /**
   * Normalize listing data from API to expected format
   */
  function normalizeListing(data) {
    if (!data) return data;
    return {
      ...data,
      name: data.name || data.title || '',
      description: data.description || data.description_md || '',
      city: data.city || data.region || '',
      species: data.species || (data.species_tags ? data.species_tags.split(',').map(s => s.trim()) : []),
      image_url: data.image_url || data.featured_image_url || '',
      website: data.website || data.website_url || '',
      contact_info: data.contact_info || data.contact_email || ''
    };
  }

  /**
   * Normalize product data from API to expected format
   */
  function normalizeProduct(data) {
    if (!data) return data;
    return {
      ...data,
      name: data.name || data.title || '',
      description: data.description || data.short_description || data.description_md || '',
      image_url: data.image_url || data.featured_image_url || ''
    };
  }

  /**
   * Normalize blog post data from API to expected format
   */
  function normalizePost(data) {
    if (!data) return data;
    return {
      ...data,
      content: data.content || data.content_md || '',
      image_url: data.image_url || data.featured_image_url || ''
    };
  }

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
   * Directory Listing Card - Field Guide Style
   */
  function listingCard(listing) {
    // Normalize the data first
    const normalized = normalizeListing(listing);
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
    } = normalized || {};

    const imageUrl = image_url || getPlaceholderImage('listing');
    const speciesArray = Array.isArray(species) ? species : (species ? [species] : []);
    const location = [city, state].filter(Boolean).join(', ');

    // Generate pseudo-coordinates for visual effect
    const coordLat = (37 + Math.random() * 2).toFixed(4);
    const coordLng = (76 + Math.random() * 2).toFixed(4);

    return `
      <article class="card card--listing">
        <a href="listing.html?slug=${encodeURIComponent(slug)}" class="card__image-wrap" aria-label="View ${escapeHtml(name)}">
          <div class="card__image">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy">
            <div class="card__image-overlay"></div>
          </div>
          ${type ? `
            <div class="card__stamp">
              <span class="card__stamp-text">${escapeHtml(type)}</span>
            </div>
          ` : ''}
          <div class="card__compass">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
            </svg>
          </div>
        </a>
        <div class="card__content">
          <div class="card__location-bar">
            <span class="card__coords">${coordLat}°N ${coordLng}°W</span>
            ${access ? `<span class="card__access card__access--${access.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(access)}</span>` : ''}
          </div>
          <h3 class="card__title">
            <a href="listing.html?slug=${encodeURIComponent(slug)}">${escapeHtml(name)}</a>
          </h3>
          ${location ? `
            <div class="card__region">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>${escapeHtml(location)}</span>
            </div>
          ` : ''}
          ${description ? `<p class="card__excerpt">${escapeHtml(truncate(description, 100))}</p>` : ''}
          ${speciesArray.length > 0 ? `
            <div class="card__species">
              <span class="card__species-label">Game:</span>
              <div class="card__species-list">
                ${speciesArray.slice(0, 3).map(s => `<span class="card__species-tag">${escapeHtml(s)}</span>`).join('')}
                ${speciesArray.length > 3 ? `<span class="card__species-more">+${speciesArray.length - 3}</span>` : ''}
              </div>
            </div>
          ` : ''}
          <div class="card__cta">
            <span class="card__cta-text">View Location</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
        <div class="card__corner card__corner--tl"></div>
        <div class="card__corner card__corner--tr"></div>
        <div class="card__corner card__corner--bl"></div>
        <div class="card__corner card__corner--br"></div>
      </article>
    `;
  }

  /**
   * Blog Post Card - Editorial Magazine Style
   */
  function postCard(post) {
    // Normalize the data first
    const normalized = normalizePost(post);
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
    } = normalized || {};

    const imageUrl = image_url || getPlaceholderImage('blog');
    const displayExcerpt = excerpt || truncate(content, 100);

    // Parse date for display
    const dateObj = published_at ? new Date(published_at) : new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    // Estimate read time (rough: 200 words per minute)
    const wordCount = (content || excerpt || '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return `
      <article class="card card--post">
        <a href="post.html?slug=${encodeURIComponent(slug)}" class="card__image-wrap" aria-label="Read ${escapeHtml(title)}">
          <div class="card__image">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy">
            <div class="card__image-overlay"></div>
          </div>
          <div class="card__date-badge">
            <span class="card__date-day">${day}</span>
            <span class="card__date-month">${month}</span>
          </div>
          <div class="card__read-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span>${readTime} min read</span>
          </div>
        </a>
        <div class="card__content">
          ${category_name ? `
            <a href="blog-category.html?slug=${encodeURIComponent(category_slug)}" class="card__category-pill">${escapeHtml(category_name)}</a>
          ` : ''}
          <h3 class="card__title">
            <a href="post.html?slug=${encodeURIComponent(slug)}">${escapeHtml(title)}</a>
          </h3>
          ${displayExcerpt ? `<p class="card__excerpt">${escapeHtml(displayExcerpt)}</p>` : ''}
          <div class="card__author-row">
            <div class="card__author-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="card__author-info">
              ${author ? `<span class="card__author-name">${escapeHtml(author)}</span>` : ''}
              <span class="card__author-date">${month} ${day}, ${year}</span>
            </div>
            <a href="post.html?slug=${encodeURIComponent(slug)}" class="card__read-link">
              Read
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="card__shine"></div>
      </article>
    `;
  }

  /**
   * Product Card - Outfitter's Catalog Style
   */
  function productCard(product) {
    // Normalize the data first
    const normalized = normalizeProduct(product);
    const {
      slug = '',
      name = 'Unnamed Product',
      description = '',
      price = 0,
      category_name = '',
      category_slug = '',
      image_url = '',
      thrivecart_checkout_url = '',
      status = 'active'
    } = normalized || {};

    const imageUrl = image_url || getPlaceholderImage('product');
    const hasCheckoutUrl = thrivecart_checkout_url &&
      thrivecart_checkout_url !== '' &&
      thrivecart_checkout_url !== 'https://example.com/thrivecart-checkout-link';

    // Determine availability based on status field
    const statusLower = (status || 'active').toLowerCase();
    const isInStock = statusLower === 'active' || statusLower === 'in_stock' || statusLower === 'in stock';
    const isComingSoon = statusLower === 'coming_soon' || statusLower === 'coming soon';
    const isOutOfStock = statusLower === 'out_of_stock' || statusLower === 'out of stock';

    // Get status display text
    let stockText = 'In Stock';
    let stockClass = 'card__stock-dot--available';
    if (isComingSoon) {
      stockText = 'Coming Soon';
      stockClass = 'card__stock-dot--soon';
    } else if (isOutOfStock) {
      stockText = 'Out of Stock';
      stockClass = 'card__stock-dot--unavailable';
    } else if (!isInStock) {
      stockText = 'Coming Soon';
      stockClass = 'card__stock-dot--soon';
    }

    // Can purchase if in stock AND has checkout URL
    const canPurchase = isInStock && hasCheckoutUrl;

    // Generate item number for catalog effect
    const itemNum = Math.floor(Math.random() * 9000) + 1000;

    return `
      <article class="card card--product">
        <a href="product.html?slug=${encodeURIComponent(slug)}" class="card__image-wrap" aria-label="View ${escapeHtml(name)}">
          <div class="card__image">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy">
            <div class="card__image-overlay"></div>
          </div>
          ${category_name ? `
            <div class="card__ribbon">
              <span class="card__ribbon-text">${escapeHtml(category_name)}</span>
            </div>
          ` : ''}
          <div class="card__price-tag">
            <span class="card__price-currency">$</span>
            <span class="card__price-amount">${parseFloat(price).toFixed(0)}</span>
            <span class="card__price-cents">${(parseFloat(price) % 1).toFixed(2).substring(2)}</span>
          </div>
          <div class="card__item-number">
            <span>Item #${itemNum}</span>
          </div>
        </a>
        <div class="card__content">
          <h3 class="card__title">
            <a href="product.html?slug=${encodeURIComponent(slug)}">${escapeHtml(name)}</a>
          </h3>
          ${description ? `<p class="card__excerpt">${escapeHtml(truncate(description, 90))}</p>` : ''}
          <div class="card__product-footer">
            <div class="card__availability">
              <span class="card__stock-dot ${stockClass}"></span>
              <span class="card__stock-text">${stockText}</span>
            </div>
            ${canPurchase
              ? `<a href="${escapeHtml(thrivecart_checkout_url)}" class="card__buy-btn" target="_blank" rel="noopener noreferrer">
                  <span>Add to Kit</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </a>`
              : `<a href="product.html?slug=${encodeURIComponent(slug)}" class="card__details-btn">
                  <span>View Details</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>`
            }
          </div>
        </div>
        <div class="card__quality-seal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
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
    // Normalizers
    normalizeListing,
    normalizeProduct,
    normalizePost,
    // Utilities
    escapeHtml,
    truncate,
    formatDate,
    formatPrice,
    getPlaceholderImage,
    // Card templates
    listingCard,
    postCard,
    productCard,
    categoryTab,
    cardSkeleton,
    loadingGrid,
    // States
    emptyState,
    errorState,
    loading,
    successMessage,
    selectOption
  };
})();

// Make Templates available globally
window.Templates = Templates;
