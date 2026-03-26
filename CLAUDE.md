# Müller's Hotel Website

## Project Overview
Static hotel website for three buildings: Müller's 1, Müller's 2, and Müller's 3.
Deployed on Vercel at https://mullershu.vercel.app

## Tech Stack
- **Frontend**: Static HTML, CSS, JavaScript (no framework, no build step)
- **Tooling**: Python script for image optimization (`optimize_images.py`)
- **Hosting**: Vercel (auto-deploys from GitHub)
- **Repo**: https://github.com/valentin-muller/mullershu

## Project Structure
```
/
├── index.html              # Main landing page
├── style.css               # Global styles
├── script.js               # Global JavaScript
├── mullers1/index.html     # Müller's 1 building page
├── mullers2/index.html     # Müller's 2 building page
├── mullers3/index.html     # Müller's 3 building page
├── blog/                   # Blog section
│   ├── index.html
│   ├── hamarosan.html
│   ├── osztalykirandulas/
│   └── programajanlo/
├── assets/                 # Images and static assets
│   ├── mullers1/           # Building 1 photos
│   ├── mullers2/           # Building 2 photos
│   ├── mullers3/           # Building 3 photos
│   ├── blog/               # Blog assets (PDFs, HTML)
│   ├── consent.css         # Cookie consent styles
│   ├── consent.js          # Cookie consent script
│   └── logo.png / logo.ico
├── images/                 # Additional/optimized images
├── adatkezeles.html        # Privacy policy (GDPR)
├── aszf.html               # Terms and conditions
├── cookie.html             # Cookie policy
├── optimize_images.py      # Python image optimization script
└── package.json            # Node dependencies
```

## Running Locally
This is a static site — no build step required. Open any HTML file directly, or use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node
npx serve .
```

Then visit http://localhost:8000

## Deployment
- **Production**: Push to `main` branch → auto-deploys to https://mullershu.vercel.app
- **Preview**: Push to any other branch → Vercel generates a unique preview URL
- **Manual**: `vercel` (preview) or `vercel --prod` (production) via CLI

## Git Workflow Rules

### NEVER commit directly to `main`
Always create a feature branch, make changes there, and merge via PR or fast-forward merge.

```bash
# Start new work
git checkout -b feature/description-of-change

# When done, push and create PR (or merge locally)
git push -u origin feature/description-of-change
```

### Branch naming conventions
- `feature/` — new features or pages
- `fix/` — bug fixes
- `content/` — text/image content updates
- `style/` — CSS-only changes

### Commit messages
- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Keep the first line under 72 characters

### Before pushing
- Test locally by opening the changed pages in a browser
- Make sure no broken links or missing images
- Check that the site looks correct on mobile (responsive)

## Important Notes
- The site is in Hungarian — all user-facing content should remain in Hungarian
- Images are large JPGs/PNGs — use `optimize_images.py` if adding new images
- There are two image directories (`assets/` and `images/`) — `assets/` is the primary one used in HTML
- Legal pages (adatkezeles, aszf, cookie) should only be edited with owner approval
