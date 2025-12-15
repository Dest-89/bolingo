/**
 * BOLINGO Listing Detail Page JavaScript
 * Handles single listing display
 */

(function() {
  'use strict';

  /**
   * Render listing detail
   */
  function renderListing(listing) {
    // Normalize the data from API
    const normalized = Templates.normalizeListing(listing);
    const {
      name = 'Unnamed Location',
      description = '',
      type = '',
      access = '',
      state = '',
      city = '',
      address = '',
      latitude = '',
      longitude = '',
      species = [],
      amenities = [],
      regulations = '',
      contact_info = '',
      website = '',
      image_url = ''
    } = normalized;

    const imageUrl = image_url || Templates.getPlaceholderImage('listing');
    const speciesArray = Array.isArray(species) ? species : (species ? species.split(',').map(s => s.trim()) : []);
    const amenitiesArray = Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(a => a.trim()) : []);
    const location = [city, state].filter(Boolean).join(', ');
    const fullAddress = [address, city, state].filter(Boolean).join(', ');

    return `
      <div class="detail__grid">
        <div class="detail__main">
          <div class="detail__image">
            <img src="${Templates.escapeHtml(imageUrl)}" alt="${Templates.escapeHtml(name)}" loading="eager">
          </div>

          <div class="detail__meta">
            ${type ? `
              <span class="detail__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                ${Templates.escapeHtml(type)}
              </span>
            ` : ''}
            ${access ? `
              <span class="detail__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                ${Templates.escapeHtml(access)}
              </span>
            ` : ''}
            ${location ? `
              <span class="detail__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                ${Templates.escapeHtml(location)}
              </span>
            ` : ''}
          </div>

          <div class="detail__content">
            ${description ? `
              <h2>About This Location</h2>
              <p>${Templates.escapeHtml(description)}</p>
            ` : ''}

            ${speciesArray.length > 0 ? `
              <h2>Available Species</h2>
              <div class="card__tags" style="margin-bottom: var(--space-6);">
                ${speciesArray.map(s => `<span class="card__tag">${Templates.escapeHtml(s)}</span>`).join('')}
              </div>
            ` : ''}

            ${amenitiesArray.length > 0 ? `
              <h2>Amenities</h2>
              <ul>
                ${amenitiesArray.map(a => `<li>${Templates.escapeHtml(a)}</li>`).join('')}
              </ul>
            ` : ''}

            ${regulations ? `
              <h2>Regulations & Notes</h2>
              <p>${Templates.escapeHtml(regulations)}</p>
            ` : ''}
          </div>
        </div>

        <aside class="detail__sidebar">
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">Location Details</h3>
            ${fullAddress ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">Address</span>
                <span class="sidebar-card__value">${Templates.escapeHtml(fullAddress)}</span>
              </div>
            ` : ''}
            ${type ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">Type</span>
                <span class="sidebar-card__value">${Templates.escapeHtml(type)}</span>
              </div>
            ` : ''}
            ${access ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">Access</span>
                <span class="sidebar-card__value">${Templates.escapeHtml(access)}</span>
              </div>
            ` : ''}
            ${latitude && longitude ? `
              <div class="sidebar-card__item">
                <span class="sidebar-card__label">Coordinates</span>
                <span class="sidebar-card__value">${latitude}, ${longitude}</span>
              </div>
            ` : ''}
          </div>

          ${contact_info || website ? `
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">Contact</h3>
              ${contact_info ? `
                <div class="sidebar-card__item">
                  <span class="sidebar-card__label">Info</span>
                  <span class="sidebar-card__value">${Templates.escapeHtml(contact_info)}</span>
                </div>
              ` : ''}
              ${website ? `
                <div class="sidebar-card__item">
                  <a href="${Templates.escapeHtml(website)}" class="btn btn--outline btn--full" target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="sidebar-card">
            <a href="/directory.html" class="btn btn--ghost btn--full">
              &larr; Back to Directory
            </a>
          </div>
        </aside>
      </div>
    `;
  }

  /**
   * Load listing from API
   */
  async function loadListing() {
    const slug = UI.getQueryParam('slug');
    const contentEl = document.getElementById('listing-content');
    const titleEl = document.getElementById('listing-title');
    const breadcrumbEl = document.getElementById('breadcrumb-name');

    if (!slug) {
      contentEl.innerHTML = Templates.errorState(
        'No Listing Specified',
        'Please select a listing from the directory.'
      );
      titleEl.textContent = 'Listing Not Found';
      return;
    }

    try {
      const response = await API.getDirectoryListing(slug);
      const listing = response.data || response.listing || response;

      if (!listing || !listing.name) {
        throw new Error('Listing not found');
      }

      // Normalize listing data
      const normalizedListing = Templates.normalizeListing(listing);

      // Update page content
      contentEl.innerHTML = renderListing(listing);
      contentEl.setAttribute('aria-busy', 'false');

      // Update page title and breadcrumb
      titleEl.textContent = normalizedListing.name;
      breadcrumbEl.textContent = normalizedListing.name;

      // Update SEO
      UI.setPageMeta({
        title: normalizedListing.name,
        description: normalizedListing.description || `Hunting location: ${normalizedListing.name} in ${normalizedListing.city || ''}, ${normalizedListing.state || ''}`,
        ogTitle: normalizedListing.name,
        ogDescription: normalizedListing.description,
        ogImage: normalizedListing.image_url,
        canonical: `https://bolingo.com/listing.html?slug=${encodeURIComponent(slug)}`
      });

    } catch (error) {
      console.error('Error loading listing:', error);
      contentEl.innerHTML = Templates.errorState(
        'Listing Not Found',
        'The requested hunting location could not be found.'
      );
      titleEl.textContent = 'Listing Not Found';
    }
  }

  /**
   * Initialize page
   */
  function init() {
    loadListing();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
