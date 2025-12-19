# BOLINGO - Hunting Directory, Blog & Store

## Project Overview
A production-ready MVP website for the hunting niche featuring:
- **Directory**: Searchable hunting location database (Hampton, VA region)
- **Blog**: Categories and posts with dynamic content
- **Store**: Product catalog with ThriveCart checkout integration
- **Admin Portal**: Full CMS dashboard for content management

## Tech Stack
- Vanilla HTML5/CSS3/JavaScript (no frameworks)
- GitHub REST API for content storage (markdown files with YAML frontmatter)
- GitHub Pages for static hosting
- ThriveCart for checkout processing

## Design System
**Theme**: Lodge Luxury - Refined wilderness aesthetic

### Typography
- **Headings**: `Bebas Neue` - Bold, impactful display font
- **Body**: `Source Serif 4` - Elegant, readable serif
- **Accents**: `Cormorant Garamond` - Refined, classic serif

### Color Palette
```css
--color-primary: #C9A227;        /* Aged brass/antique gold */
--color-secondary: #2A4A1A;      /* Deep forest green */
--color-accent: #8B4513;         /* Saddle brown */
--color-bg-dark: #0C0B09;        /* Warm near-black */
--color-bg-card: #161412;        /* Dark walnut */
--color-text: #E8E4DC;           /* Warm off-white */
--color-text-muted: #9C9588;     /* Weathered stone */
```

## File Structure
```
/bolingo
├── /content                      # GitHub-stored content (markdown + YAML)
│   ├── /blog
│   │   ├── /categories
│   │   │   └── *.md              # Blog category definitions
│   │   └── /posts
│   │       └── *.md              # Blog posts
│   ├── /store
│   │   ├── /categories
│   │   │   └── *.md              # Store category definitions
│   │   └── /products
│   │       └── *.md              # Product listings
│   └── /directory
│       └── /listings
│           └── *.md              # Hunting location listings
├── /components
│   ├── header.html               # Reusable header
│   └── footer.html               # Reusable footer
├── /assets
│   ├── /css
│   │   └── styles.css            # All styles (mobile-first)
│   └── /js
│       ├── api.js                # GitHub API communication layer
│       ├── ui.js                 # UI utilities (toasts, loading)
│       ├── templates.js          # HTML template functions
│       ├── headerFooter.js       # Component loader
│       └── /pages
│           ├── home.js           # Homepage logic
│           ├── directory.js      # Directory listing page
│           ├── listing.js        # Single listing detail
│           ├── blog.js           # Blog posts list
│           ├── blogCategory.js   # Posts by category
│           ├── post.js           # Single post detail
│           ├── store.js          # Products list
│           ├── storeCategory.js  # Products by category
│           ├── product.js        # Single product detail
│           └── admin.js          # Admin CMS dashboard
├── /.github
│   └── /workflows
│       └── deploy.yml            # GitHub Pages auto-deployment
├── index.html                    # Homepage
├── directory.html                # Directory listing
├── listing.html                  # Single listing (?slug=...)
├── blog.html                     # Blog posts list
├── blog-category.html            # Posts by category (?slug=...)
├── post.html                     # Single post (?slug=...)
├── store.html                    # Products list
├── store-category.html           # Products by category (?slug=...)
├── product.html                  # Single product (?slug=...)
├── about.html                    # About page
├── contact.html                  # Contact form
├── privacy.html                  # Privacy policy
├── terms.html                    # Terms of service
├── admin.html                    # Admin CMS portal
└── 404.html                      # Error page
```

## Content Storage Format

### Markdown Files with YAML Frontmatter
All content is stored as markdown files with YAML frontmatter. Example blog post:

```markdown
---
slug: duck-hunting-basics
title: "Getting Started with Duck Hunting"
category_slug: waterfowl
author: "John Smith"
featured_image_url: "https://example.com/image.jpg"
tags:
  - waterfowl
  - beginners
  - gear
status: active
published_at: "2024-12-01T08:00:00Z"
created_at: "2024-12-01T08:00:00Z"
---

Your markdown content here...
```

### Content Paths
| Content Type | GitHub Path |
|-------------|-------------|
| Blog Categories | `content/blog/categories/*.md` |
| Blog Posts | `content/blog/posts/*.md` |
| Store Categories | `content/store/categories/*.md` |
| Products | `content/store/products/*.md` |
| Directory Listings | `content/directory/listings/*.md` |

## API Architecture

### GitHub REST API Integration
The `api.js` module communicates with GitHub's REST API to:
- **Read**: Fetch markdown files and parse YAML frontmatter
- **Write**: Create/update files using Base64 encoding
- **Delete**: Remove files (requires file SHA)

### Authentication
- **Public Access**: Read operations use no auth (public repo)
- **Admin Access**: Write operations require GitHub Personal Access Token (PAT)
  - Token stored in localStorage after admin login
  - Scopes required: `repo` (full control of private repositories)

### Caching Strategy
Multi-layer caching to minimize API calls:
1. **Memory Cache**: Instant access during session
2. **Session Storage**: Persists during browser tab
3. **Local Storage**: Persists across sessions (5-minute TTL)
4. **GitHub API**: Fallback when cache is stale

### API Module Functions
```javascript
// Public read operations
API.getBlogCategories()
API.getBlogPosts(categorySlug)
API.getBlogPost(slug)
API.getStoreCategories()
API.getStoreProducts(categorySlug)
API.getStoreProduct(slug)
API.getDirectoryListings(filters)
API.getDirectoryListing(slug)

// Admin write operations (requires token)
API.saveBlogCategory(data)
API.saveBlogPost(data)
API.saveStoreCategory(data)
API.saveStoreProduct(data)
API.saveDirectoryListing(data)
API.deleteBlogCategory(slug)
API.deleteBlogPost(slug)
API.deleteStoreCategory(slug)
API.deleteStoreProduct(slug)
API.deleteDirectoryListing(slug)

// Utility
API.clearCache()
API.verifyToken(token)
```

## Development

### Running Locally
```bash
# Python
cd /Volumes/Line_16/bolingo && python3 -m http.server 8000

# Node.js
npx serve /Volumes/Line_16/bolingo

# Then open http://localhost:8000 or the serve URL
```

### Key Files to Modify

**Styling**: `assets/css/styles.css`
- CSS variables at top of file for colors, fonts, spacing
- Mobile-first responsive breakpoints

**Templates**: `assets/js/templates.js`
- Card templates for listings, posts, products
- Loading states and error messages
- Data normalizers for field compatibility

**API**: `assets/js/api.js`
- GitHub API configuration
- Repository settings (owner, repo, branch)
- Token management for admin
- Caching logic

**Admin CMS**: `assets/js/pages/admin.js`
- Full CRUD operations for all content types
- Modal forms for create/edit
- Search and filtering
- Image upload support

## Admin Portal Usage

### Initial Setup
1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
   - Create token with `repo` permissions for the bolingo repository
   - Copy the token (starts with `github_pat_`)

### Using the Admin CMS
1. Navigate to `/admin.html`
2. Enter your GitHub PAT token and click Login
3. Dashboard shows overview stats for all content
4. Use sidebar navigation to manage:
   - **Blog Categories**: Create/edit/delete blog categories
   - **Blog Posts**: Write posts with markdown content
   - **Store Categories**: Organize products
   - **Products**: Add products with ThriveCart checkout URLs
   - **Directory Listings**: Add hunting locations with coordinates

### Content Fields

**Blog Post**:
- Title, Slug, Category, Author
- Featured Image URL
- Tags (comma-separated)
- Content (markdown)
- Status (active/draft)

**Product**:
- Title, Slug, Category, Brand, SKU
- Price, Featured Image URL
- ThriveCart Checkout URL
- Description (markdown)
- Status (active/draft)

**Directory Listing**:
- Name, Slug, Type, Access Level
- State, City, Address
- Latitude, Longitude
- Species Tags, Amenities
- Website URL, Contact Email
- Regulations, Featured Image URL
- Description (markdown)
- Status (active/draft)

## Deployment

### GitHub Pages (Automatic)
The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push changes to `main` branch
4. Site auto-deploys at `https://[username].github.io/bolingo/`

### Manual Deployment
Static hosting compatible: Netlify, Vercel, or any static host.
No build step required - deploy directly.

## GitHub Repository Configuration

### Repository Settings
```javascript
// In api.js
const CONFIG = {
  GITHUB_OWNER: 'Dest-89',
  GITHUB_REPO: 'bolingo',
  GITHUB_BRANCH: 'main',
  CONTENT_PATH: 'content'
};
```

### Required Repository Structure
Ensure these directories exist in your GitHub repository:
- `content/blog/categories/`
- `content/blog/posts/`
- `content/store/categories/`
- `content/store/products/`
- `content/directory/listings/`

## Troubleshooting

### Common Issues

**API returns empty data**
- Check if content files exist in the GitHub repository
- Verify the repository is public or token has correct permissions
- Clear browser cache: `API.clearCache()` in console

**Admin login fails**
- Verify GitHub PAT has `repo` scope
- Check token hasn't expired
- Ensure repository name matches CONFIG settings

**Content not updating**
- Clear cache using "Clear Cache" button in admin
- Check GitHub for file creation/update timestamps
- Verify file SHA matches for updates

**Images not loading**
- Use direct image URLs (not GitHub file view URLs)
- For GitHub-hosted images, use raw.githubusercontent.com URLs
