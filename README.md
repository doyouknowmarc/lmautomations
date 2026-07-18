# lmautomations

The production website for Liam & Marc Automations, published at [lmautomations.com](https://lmautomations.com).

Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. Fonts and media are self-hosted, and the production site has no third-party script dependencies.

## Local development

Requires Node.js 20.19 or newer (or Node.js 22.12+).

```bash
npm install
npm run dev
```

The local site is available at `http://localhost:5173/`.

## Production verification

```bash
npm run check:deployment
```

This creates `dist/` and checks the static pages, production metadata, custom-domain URLs, sitemap, media budgets, and compiled assets.

## GitHub Pages deployment

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds and deploys the site when `main` is pushed. It can also be run manually from the Actions tab.

In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the source. Add `lmautomations.com` under **Custom domain** before changing DNS at the domain provider.
