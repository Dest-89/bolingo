/**
 * BOLINGO Post Detail Page JavaScript
 * Handles single blog post display
 */

(function() {
  'use strict';

  /**
   * Convert markdown-like content to HTML
   */
  function parseContent(content) {
    if (!content) return '';

    // Escape HTML first
    let html = Templates.escapeHtml(content);

    // Convert line breaks to paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';

      // Check for headers (## Header)
      if (p.startsWith('## ')) {
        return `<h2>${p.substring(3)}</h2>`;
      }
      if (p.startsWith('### ')) {
        return `<h3>${p.substring(4)}</h3>`;
      }

      // Check for lists
      if (p.startsWith('- ') || p.startsWith('* ')) {
        const items = p.split(/\n/).map(line => {
          const text = line.replace(/^[-*]\s*/, '');
          return `<li>${text}</li>`;
        }).join('');
        return `<ul>${items}</ul>`;
      }

      // Regular paragraph
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  /**
   * Render post detail
   */
  function renderPost(post) {
    // Normalize the data from API
    const normalized = Templates.normalizePost(post);
    const {
      title = 'Untitled Post',
      content = '',
      excerpt = '',
      author = '',
      published_at = '',
      category_name = '',
      category_slug = '',
      image_url = '',
      tags = []
    } = normalized;

    const imageUrl = image_url || Templates.getPlaceholderImage('blog');
    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
    const parsedContent = parseContent(content);

    return `
      <div class="detail__grid">
        <div class="detail__main">
          <div class="detail__image">
            <img src="${Templates.escapeHtml(imageUrl)}" alt="${Templates.escapeHtml(title)}" loading="eager">
          </div>

          <div class="detail__meta">
            ${category_name ? `
              <a href="/blog-category.html?slug=${encodeURIComponent(category_slug)}" class="detail__meta-item" style="color: var(--color-primary);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                ${Templates.escapeHtml(category_name)}
              </a>
            ` : ''}
            ${author ? `
              <span class="detail__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                ${Templates.escapeHtml(author)}
              </span>
            ` : ''}
            ${published_at ? `
              <span class="detail__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
                ${Templates.formatDate(published_at)}
              </span>
            ` : ''}
          </div>

          <div class="detail__content">
            ${parsedContent || `<p>${Templates.escapeHtml(excerpt)}</p>` || '<p>No content available.</p>'}
          </div>

          ${tagsArray.length > 0 ? `
            <div style="margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--color-border);">
              <h4 style="margin-bottom: var(--space-3);">Tags</h4>
              <div class="card__tags">
                ${tagsArray.map(t => `<span class="card__tag">${Templates.escapeHtml(t)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <aside class="detail__sidebar">
          ${category_name ? `
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">Category</h3>
              <a href="/blog-category.html?slug=${encodeURIComponent(category_slug)}" class="btn btn--outline btn--full">
                ${Templates.escapeHtml(category_name)}
              </a>
            </div>
          ` : ''}

          <div class="sidebar-card">
            <h3 class="sidebar-card__title">Share Article</h3>
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <button onclick="shareOnTwitter()" class="btn btn--ghost btn--sm" aria-label="Share on Twitter">Twitter</button>
              <button onclick="shareOnFacebook()" class="btn btn--ghost btn--sm" aria-label="Share on Facebook">Facebook</button>
              <button onclick="copyLink()" class="btn btn--ghost btn--sm" aria-label="Copy link">Copy Link</button>
            </div>
          </div>

          <div class="sidebar-card">
            <a href="/blog.html" class="btn btn--ghost btn--full">
              &larr; Back to Blog
            </a>
          </div>
        </aside>
      </div>
    `;
  }

  /**
   * Load post from API
   */
  async function loadPost() {
    const slug = UI.getQueryParam('slug');
    const contentEl = document.getElementById('post-content');
    const titleEl = document.getElementById('post-title');
    const breadcrumbEl = document.getElementById('breadcrumb-post');

    if (!slug) {
      contentEl.innerHTML = Templates.errorState(
        'No Post Specified',
        'Please select a post from the blog.'
      );
      titleEl.textContent = 'Post Not Found';
      return;
    }

    try {
      const response = await API.getBlogPost(slug);
      const post = response.data || response.post || response;

      if (!post || !post.title) {
        throw new Error('Post not found');
      }

      // Normalize post data
      const normalizedPost = Templates.normalizePost(post);

      // Update page content
      contentEl.innerHTML = renderPost(post);
      contentEl.setAttribute('aria-busy', 'false');

      // Update page title and breadcrumb
      titleEl.textContent = normalizedPost.title;
      breadcrumbEl.textContent = Templates.truncate(normalizedPost.title, 30);

      // Update SEO
      UI.setPageMeta({
        title: normalizedPost.title,
        description: normalizedPost.excerpt || Templates.truncate(normalizedPost.content, 160),
        ogTitle: normalizedPost.title,
        ogDescription: normalizedPost.excerpt || Templates.truncate(normalizedPost.content, 160),
        ogImage: normalizedPost.image_url,
        canonical: `https://bolingo.com/post.html?slug=${encodeURIComponent(slug)}`
      });

      // Store current URL for sharing
      window.currentPostUrl = window.location.href;
      window.currentPostTitle = normalizedPost.title;

    } catch (error) {
      console.error('Error loading post:', error);
      contentEl.innerHTML = Templates.errorState(
        'Post Not Found',
        'The requested article could not be found.'
      );
      titleEl.textContent = 'Post Not Found';
    }
  }

  // Share functions (global for onclick handlers)
  window.shareOnTwitter = function() {
    const url = encodeURIComponent(window.currentPostUrl || window.location.href);
    const text = encodeURIComponent(window.currentPostTitle || document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=550,height=420');
  };

  window.shareOnFacebook = function() {
    const url = encodeURIComponent(window.currentPostUrl || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
  };

  window.copyLink = function() {
    UI.copyToClipboard(window.currentPostUrl || window.location.href);
  };

  /**
   * Initialize page
   */
  function init() {
    loadPost();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
