/**
 * BOLINGO Directory Page JavaScript
 * Handles listing search, filtering, and display
 */

(function() {
  'use strict';

  // DOM Elements
  let listingsGrid;
  let resultsInfo;
  let filterForm;
  let applyFiltersBtn;
  let clearFiltersBtn;

  // Current listings cache
  let allListings = [];

  /**
   * Get current filter values
   */
  function getFilterValues() {
    return {
      q: document.getElementById('filter-search')?.value?.trim() || '',
      type: document.getElementById('filter-type')?.value || '',
      access: document.getElementById('filter-access')?.value || '',
      state: document.getElementById('filter-state')?.value || '',
      species: document.getElementById('filter-species')?.value || ''
    };
  }

  /**
   * Set filter values from URL params
   */
  function setFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const searchInput = document.getElementById('filter-search');
    const typeSelect = document.getElementById('filter-type');
    const accessSelect = document.getElementById('filter-access');
    const stateSelect = document.getElementById('filter-state');
    const speciesSelect = document.getElementById('filter-species');

    if (searchInput && params.get('q')) searchInput.value = params.get('q');
    if (typeSelect && params.get('type')) typeSelect.value = params.get('type');
    if (accessSelect && params.get('access')) accessSelect.value = params.get('access');
    if (stateSelect && params.get('state')) stateSelect.value = params.get('state');
    if (speciesSelect && params.get('species')) speciesSelect.value = params.get('species');
  }

  /**
   * Update URL with filter values
   */
  function updateUrlWithFilters(filters) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  /**
   * Load listings from API
   */
  async function loadListings(filters = {}) {
    if (!listingsGrid) return;

    listingsGrid.innerHTML = Templates.loadingGrid(6);
    listingsGrid.setAttribute('aria-busy', 'true');
    resultsInfo.textContent = 'Searching...';

    try {
      const response = await API.getDirectoryListings(filters);
      let listings = response.data || response.listings || response || [];

      if (!Array.isArray(listings)) {
        listings = [];
      }

      allListings = listings;
      renderListings(listings);

    } catch (error) {
      console.error('Error loading listings:', error);
      listingsGrid.innerHTML = Templates.errorState(
        'Unable to Load Listings',
        error.message || 'Please try again later.'
      );
      resultsInfo.textContent = 'Error loading results';
    } finally {
      listingsGrid.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Render listings to grid
   */
  function renderListings(listings) {
    if (!listingsGrid) return;

    if (listings.length === 0) {
      listingsGrid.innerHTML = Templates.emptyState(
        'No Listings Found',
        'Try adjusting your filters or search terms.',
        true,
        'Clear Filters',
        '#'
      );

      // Add click handler for clear filters in empty state
      const clearBtn = listingsGrid.querySelector('.btn--primary');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.preventDefault();
          clearFilters();
        });
      }

      resultsInfo.textContent = 'No results found';
      return;
    }

    listingsGrid.innerHTML = listings.map(Templates.listingCard).join('');
    resultsInfo.textContent = UI.pluralize(listings.length, 'hunting spot') + ' found';
  }

  /**
   * Apply filters
   */
  function applyFilters() {
    const filters = getFilterValues();
    updateUrlWithFilters(filters);
    loadListings(filters);
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    // Reset form
    if (filterForm) {
      filterForm.reset();
    }

    // Clear URL
    window.history.replaceState({}, '', window.location.pathname);

    // Reload all listings
    loadListings({});
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Apply filters button
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Search input - debounced auto-search
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', UI.debounce(() => {
        applyFilters();
      }, 500));

      // Enter key to search
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyFilters();
        }
      });
    }

    // Filter selects - auto-apply on change
    const selects = filterForm?.querySelectorAll('select');
    selects?.forEach(select => {
      select.addEventListener('change', () => {
        applyFilters();
      });
    });
  }

  /**
   * Update page SEO based on filters
   */
  function updatePageSEO(filters) {
    let title = 'Hunting Directory';
    let description = 'Browse our comprehensive directory of hunting spots';

    const parts = [];
    if (filters.state) parts.push(filters.state);
    if (filters.type) parts.push(filters.type);
    if (filters.species) parts.push(filters.species);

    if (parts.length > 0) {
      title = `${parts.join(' ')} Hunting Spots | Directory`;
      description = `Find ${parts.join(', ')} hunting locations in our directory.`;
    }

    UI.setPageMeta({ title, description });
  }

  /**
   * Initialize directory page
   */
  function init() {
    // Get DOM elements
    listingsGrid = document.getElementById('listings-grid');
    resultsInfo = document.getElementById('results-info');
    filterForm = document.getElementById('filters-form');
    applyFiltersBtn = document.getElementById('apply-filters');
    clearFiltersBtn = document.getElementById('clear-filters');

    // Set filters from URL
    setFiltersFromUrl();

    // Initialize event listeners
    initEventListeners();

    // Load initial listings
    const initialFilters = getFilterValues();
    updatePageSEO(initialFilters);
    loadListings(initialFilters);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
