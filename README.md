# BOLINGO - Hunting Directory, Blog & Store MVP

A complete, production-quality MVP website for the hunting niche, featuring a directory of hunting places, blog with categories, and store catalog with ThriveCart checkout integration.

## Admin Access

**Admin Portal (private):** https://dest-89.github.io/bolingo/admin.html

## Features

- **Directory Module**: Searchable/filterable hunting location database (Hampton, VA demo region)
- **Blog Module**: Categories and posts with dynamic content rendering
- **Store Module**: Product catalog with ThriveCart checkout integration
- **Admin CMS**: Full content management dashboard
- **Mobile-First Design**: Responsive, dark outdoorsy "Lodge Luxury" theme
- **GitHub-Powered**: Content stored as markdown files with YAML frontmatter

## Tech Stack

- Vanilla HTML5/CSS3/JavaScript (no frameworks)
- GitHub REST API for content storage
- GitHub Pages for hosting with auto-deployment
- ThriveCart for checkout processing

## File Structure

```
/bolingo
├── /content                     # GitHub-stored content (markdown + YAML)
│   ├── /blog
│   │   ├── /categories          # Blog category definitions
│   │   └── /posts               # Blog posts
│   ├── /store
│   │   ├── /categories          # Store category definitions
│   │   └── /products            # Product listings
│   └── /directory
│       └── /listings            # Hunting location listings
├── /components
│   ├── header.html              # Reusable header component
│   └── footer.html              # Reusable footer component
├── /assets
│   ├── /css
│   │   └── styles.css           # All styles (mobile-first)
│   └── /js
│       ├── api.js               # GitHub API communication layer
│       ├── ui.js                # UI utilities
│       ├── templates.js         # HTML template functions
│       ├── headerFooter.js      # Header/footer loader
│       └── /pages
│           ├── home.js
│           ├── directory.js
│           ├── listing.js
│           ├── blog.js
│           ├── blogCategory.js
│           ├── post.js
│           ├── store.js
│           ├── storeCategory.js
│           ├── product.js
│           └── admin.js
├── /.github
│   └── /workflows
│       └── deploy.yml           # GitHub Pages auto-deployment
├── index.html                   # Homepage
├── directory.html               # Directory listing page
├── listing.html                 # Single listing detail (?slug=...)
├── blog.html                    # Blog posts list
├── blog-category.html           # Blog posts by category (?slug=...)
├── post.html                    # Single post detail (?slug=...)
├── store.html                   # Products list
├── store-category.html          # Products by category (?slug=...)
├── product.html                 # Single product detail (?slug=...)
├── about.html                   # About page
├── contact.html                 # Contact page with form
├── privacy.html                 # Privacy policy
├── terms.html                   # Terms of service
├── admin.html                   # Admin CMS portal
└── 404.html                     # Error page
```

## Content Storage

All content is stored as markdown files with YAML frontmatter in the `/content` directory:

| Content Type | Path |
|-------------|------|
| Blog Categories | `content/blog/categories/*.md` |
| Blog Posts | `content/blog/posts/*.md` |
| Store Categories | `content/store/categories/*.md` |
| Products | `content/store/products/*.md` |
| Directory Listings | `content/directory/listings/*.md` |

### Example Content File

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
status: active
published_at: "2024-12-01T08:00:00Z"
---

Your markdown content here...
```

## Running Locally

### Option 1: VSCode Live Server (Recommended)

1. Open the `/bolingo` folder in VSCode
2. Install the "Live Server" extension
3. Right-click `index.html` and select "Open with Live Server"
4. Site will open at `http://127.0.0.1:5500`

### Option 2: Python HTTP Server

```bash
cd /path/to/bolingo
python3 -m http.server 8000
```

Then open `http://localhost:8000`

### Option 3: Node.js

```bash
npx serve /path/to/bolingo
```

## Deployment

### GitHub Pages (Automatic)

The repository includes a GitHub Actions workflow that automatically deploys when you push to the `main` branch.

1. Go to Settings > Pages in GitHub
2. Set source to "GitHub Actions"
3. Push changes to `main` branch
4. Site auto-deploys at `https://dest-89.github.io/bolingo/`

### Netlify

1. Push code to GitHub repository
2. Log in to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Set build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/`
6. Deploy

**Add 404 redirect**: Create `_redirects` file:
```
/*    /404.html   404
```

### Vercel

1. Import GitHub repository
2. Framework Preset: Other
3. Deploy

## Admin Portal Usage

### Initial Setup

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens
   - Create token with `repo` permissions
   - Copy the token (starts with `github_pat_`)

### Using the CMS

1. Navigate to `/admin.html`
2. Enter your GitHub PAT token and click Login
3. Dashboard shows overview stats for all content
4. Use sidebar navigation to manage content:
   - **Blog Categories**: Create/edit/delete blog categories
   - **Blog Posts**: Write posts with markdown content
   - **Store Categories**: Organize products
   - **Products**: Add products with ThriveCart checkout URLs
   - **Directory Listings**: Add hunting locations with coordinates

### ThriveCart Integration

When creating products:
- Enter the full ThriveCart checkout URL in the "ThriveCart Checkout URL" field
- Leave blank to show "Coming Soon" on product pages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance

## SEO Features

- Semantic HTML5 markup
- Meta descriptions on all pages
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Dynamic page titles

## Performance Optimizations

- Minimal dependencies (vanilla JS)
- Lazy loading images
- CSS variables for theming
- Multi-layer caching (memory, session, local storage)
- Efficient DOM manipulation
- Error state handling

## Customization

### Changing Colors

Edit CSS variables in `assets/css/styles.css`:

```css
:root {
  --color-primary: #C9A227;        /* Gold accent */
  --color-secondary: #2A4A1A;      /* Forest green */
  --color-accent: #8B4513;         /* Saddle brown */
  --color-bg-dark: #0C0B09;        /* Background */
  /* ... more variables */
}
```

### Changing Fonts

Edit font imports and variables:

```css
/* In <head> of HTML files */
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">

/* In styles.css */
:root {
  --font-primary: 'YourFont', sans-serif;
  --font-heading: 'YourHeadingFont', sans-serif;
}
```

### Adding New Pages

1. Create new HTML file with standard structure
2. Include header/footer placeholders and script tags
3. Create page-specific JS in `/assets/js/pages/`
4. Add navigation links to `header.html` and `footer.html`

## License

MIT License - See LICENSE file for details.

## Support

For questions or issues, visit the admin portal or contact the development team.

---

Built with care for the hunting community.
