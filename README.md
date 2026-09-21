# LIN  Portfolio

Static portfolio website prepared for GitHub and Vercel deployment.

GitHub Pages is deployed automatically from `main` by the workflow in
`.github/workflows/deploy-pages.yml`.

## Structure

- `index.html` — homepage and application code
- `assets/` — only media files referenced by the homepage
- `vercel.json` — static caching and security headers

## Deploy to Vercel

Import this repository in Vercel and use these settings:

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty

No environment variables are required.
