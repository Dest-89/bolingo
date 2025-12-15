/**
 * BOLINGO Blog Category Page JavaScript
 * Handles filtered blog posts by category
 */

(function() {
  'use strict';

  // DOM Elements
  let postsGrid;
  let resultsInfo;
  let categoryTabs;
  let categoryTitle;
  let breadcrumbCategory;

  // Current category slug
  let currentSlug;

  /**
   * Load blog categories and set active tab
   */
  async function loadCategories() {
    if (!categoryTabs) return;

    try {
      const response = await API.getBlogCategories();
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
          title: `${currentCategory.name} | Blog`,
          description: currentCategory.description || `Browse ${currentCategory.name} hunting articles.`,
          canonical: `https://bolingo.com/blog-category.html?slug=${encodeURIComponent(currentSlug)}`
        });
      }

      // Render category tabs
      const tabsHtml = categories.map(cat => {
        const isActive = cat.slug === currentSlug;
        return `<a href="/blog-category.html?slug=${encodeURIComponent(cat.slug)}" class="category-tab ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>${Templates.escapeHtml(cat.name)}</a>`;
      }).join('');

      categoryTabs.innerHTML = `
        <a href="/blog.html" class="category-tab">All Posts</a>
        ${tabsHtml}
      `;

    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  /**
   * Load posts by category
   */
  async function loadPosts() {
    if (!postsGrid) return;

    postsGrid.innerHTML = Templates.loadingGrid(6);
    postsGrid.setAttribute('aria-busy', 'true');
    resultsInfo.textContent = 'Loading posts...';

    try {
      const response = await API.getBlogPosts(currentSlug);
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
        'No Posts in This Category',
        'Check back soon or browse other categories.',
        true,
        'View All Posts',
        '/blog.html'
      );
      resultsInfo.textContent = 'No posts found in this category';
      return;
    }

    postsGrid.innerHTML = posts.map(Templates.postCard).join('');
    resultsInfo.textContent = UI.pluralize(posts.length, 'post') + ' found';
  }

  /**
   * Initialize page
   */
  function init() {
    // Get slug from URL
    currentSlug = UI.getQueryParam('slug');

    if (!currentSlug) {
      // Redirect to main blog if no slug
      window.location.href = '/blog.html';
      return;
    }

    // Get DOM elements
    postsGrid = document.getElementById('posts-grid');
    resultsInfo = document.getElementById('results-info');
    categoryTabs = document.getElementById('category-tabs');
    categoryTitle = document.getElementById('category-title');
    breadcrumbCategory = document.getElementById('breadcrumb-category');

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
