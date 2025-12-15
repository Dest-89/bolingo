# BOLINGO - Hunting Directory, Blog & Store MVP

A complete, production-quality MVP website for the hunting niche, featuring a directory of hunting places, blog with categories, and store catalog with ThriveCart checkout integration.

## 🔐 Admin Access

**Admin Portal (private):** https://dest-89.github.io/bolingo/admin.html

## Features

- **Directory Module**: Searchable/filterable hunting location database (Hampton, VA demo region)
- **Blog Module**: Categories and posts with dynamic content rendering
- **Store Module**: Product catalog with ThriveCart checkout integration
- **Admin Portal**: Create and manage content via API
- **Mobile-First Design**: Responsive, dark outdoorsy theme
- **Data-Driven**: All content loaded via Google Apps Script JSON API

## Tech Stack

- Vanilla HTML5/CSS3/JavaScript (no frameworks)
- Google Apps Script backend API
- ThriveCart for checkout processing

## File Structure

```
/bolingo
├── /components
│   ├── header.html          # Reusable header component
│   └── footer.html          # Reusable footer component
├── /assets
│   ├── /css
│   │   └── styles.css       # All styles (mobile-first)
│   └── /js
│       ├── api.js           # API communication layer
│       ├── ui.js            # UI utilities
│       ├── templates.js     # HTML template functions
│       ├── headerFooter.js  # Header/footer loader
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
├── index.html               # Homepage
├── directory.html           # Directory listing page
├── listing.html             # Single listing detail (?slug=...)
├── blog.html                # Blog posts list
├── blog-category.html       # Blog posts by category (?slug=...)
├── post.html                # Single post detail (?slug=...)
├── store.html               # Products list
├── store-category.html      # Products by category (?slug=...)
├── product.html             # Single product detail (?slug=...)
├── about.html               # About page
├── contact.html             # Contact page with form
├── privacy.html             # Privacy policy
├── terms.html               # Terms of service
├── admin.html               # Admin portal
└── 404.html                 # Error page
```

## API Endpoints

**Base URL**: `https://script.google.com/macros/s/AKfycbxM9VoOA-Hch13zwC5A_uVllmVcO3pL_dbam1ITKjwp1h7ihz5b7kfwN7t82VAYCTlfng/exec`

### GET Endpoints (Public)

| Endpoint | Description | Query Params |
|----------|-------------|--------------|
| `/health` | API health check | - |
| `/blog/categories` | List blog categories | - |
| `/blog/posts` | List blog posts | `category_slug` (optional) |
| `/blog/post` | Single blog post | `slug` (required) |
| `/store/categories` | List store categories | - |
| `/store/products` | List products | `category_slug` (optional) |
| `/store/product` | Single product | `slug` (required) |
| `/directory/listings` | List hunting locations | `state`, `type`, `access`, `species`, `q` |
| `/directory/listing` | Single location | `slug` (required) |

### POST Endpoints (Admin)

Requires `X-ADMIN-TOKEN` header.

| Endpoint | Description |
|----------|-------------|
| `/blog/category` | Create blog category |
| `/blog/post` | Create blog post |
| `/store/category` | Create store category |
| `/store/product` | Create product |
| `/directory/listing` | Create directory listing |

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

### GitHub Pages

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Set source to main branch
4. Site will be available at `https://username.github.io/repo-name`

### Vercel

1. Import GitHub repository
2. Framework Preset: Other
3. Deploy

## CORS Notes

The Google Apps Script API is configured to accept requests from any origin. If you encounter CORS issues:

1. Ensure you're accessing via `http://` or `https://` (not `file://`)
2. Use a local development server (see "Running Locally")
3. For production, the API should work from any domain

## Admin Portal Usage

1. Navigate to `/admin.html`
2. Enter your admin token (obtained from API administrator)
3. Token is stored in localStorage (persists across sessions)
4. Use tabs to switch between content types
5. Fill out forms to create new content
6. Refresh public pages to see new content

### ThriveCart Integration

When creating products:
- Enter the full ThriveCart checkout URL in the "ThriveCart Checkout URL" field
- Leave blank to show "Coming Soon" on product pages
- Placeholder URL `https://example.com/thrivecart-checkout-link` also triggers "Coming Soon" state

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
- Efficient DOM manipulation
- Request timeout handling
- Error state handling

## Customization

### Changing Colors

Edit CSS variables in `assets/css/styles.css`:

```css
:root {
  --color-primary: #D4A857;        /* Gold accent */
  --color-secondary: #2D5016;      /* Forest green */
  --color-bg-dark: #0D0D0D;        /* Background */
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
