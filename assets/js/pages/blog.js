/**
 * BOLINGO Blog Page JavaScript
 * Handles blog posts listing and category filtering
 */

(function() {
  'use strict';

  // DOM Elements
  let postsGrid;
  let resultsInfo;
  let categoryTabs;

  /**
   * Load blog categories
   */
  async function loadCategories() {
    if (!categoryTabs) return;

    try {
      const response = await API.getBlogCategories();
      const categories = response.data || response.categories || response || [];

      if (!Array.isArray(categories) || categories.length === 0) {
        return; // Keep default "All Posts" tab
      }

      // Add category tabs
      const tabsHtml = categories.map(cat => {
        return `<a href="/blog-category.html?slug=${encodeURIComponent(cat.slug)}" class="category-tab">${Templates.escapeHtml(cat.name)}</a>`;
      }).join('');

      categoryTabs.innerHTML = `
        <a href="/blog.html" class="category-tab active" aria-current="page">All Posts</a>
        ${tabsHtml}
      `;

    } catch (error) {
      console.error('Error loading categories:', error);
      // Keep default tab on error
    }
  }

  /**
   * Load blog posts
   */
  async function loadPosts() {
    if (!postsGrid) return;

    postsGrid.innerHTML = Templates.loadingGrid(6);
    postsGrid.setAttribute('aria-busy', 'true');
    resultsInfo.textContent = 'Loading posts...';

    try {
      const response = await API.getBlogPosts();
      let posts = response.data || response.posts || response || [];

      if (!Array.isArray(posts)) {
        posts = [];
      }

      // Sort by date (newest first)
      posts.sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0);
        const dateB = new Date(b.published_at || b.created_at || 0);
        return dateB - dateA;
      });

      renderPosts(posts);

    } catch (error) {
      console.error('Error loading posts:', error);
      postsGrid.innerHTML = Templates.errorState(
        'Unable to Load Posts',
        error.message || 'Please try again later.'
      );
      resultsInfo.textContent = 'Error loading posts';
    } finally {
      postsGrid.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Render posts to grid
   */
  function renderPosts(posts) {
    if (!postsGrid) return;

    if (posts.length === 0) {
      postsGrid.innerHTML = Templates.emptyState(
        'No Posts Yet',
        'Check back soon for hunting tips and stories.',
        false
      );
      resultsInfo.textContent = 'No posts found';
      return;
    }

    postsGrid.innerHTML = posts.map(Templates.postCard).join('');
    resultsInfo.textContent = UI.pluralize(posts.length, 'post') + ' found';
  }

  /**
   * Initialize page
   */
  function init() {
    // Get DOM elements
    postsGrid = document.getElementById('posts-grid');
    resultsInfo = document.getElementById('results-info');
    categoryTabs = document.getElementById('category-tabs');

    // Load content
    loadCategories();
    loadPosts();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
