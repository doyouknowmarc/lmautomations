# lmautomations

The production website for Liam & Marc Automations, published at [lmautomations.com](https://lmautomations.com).

Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. Fonts and media are self-hosted, and the production site has no third-party script dependencies.

## Page experience

- **Preloader** — fonts, the hero poster, and the hero video are fetched up front behind a branded loading screen; the page is revealed with a center-split door animation ([`src/components/Preloader.tsx`](src/components/Preloader.tsx)).
- **Hero video** — scroll position is the sole source of truth: the video never plays on its own, it is scrubbed frame by frame as you scroll through the hero ([`src/components/Hero.tsx`](src/components/Hero.tsx)). Seek targets snap to the 30fps frame grid and only one seek is ever in flight, paced by `requestVideoFrameCallback` where it fires and the `seeked` event otherwise — Safari does not fire the frame callback for a paused video ([`src/components/video-scrubber.ts`](src/components/video-scrubber.ts)). A single 720p encode serves every device; the phone card is portrait, so a lower-resolution mobile cut lost most of its pixels to the `object-cover` crop and looked blocky.
- **Solutions section** — cursor-following card tilt, hover highlights, CTA underline sweeps, and a slow ambient zoom on the team image ([`src/components/Features.tsx`](src/components/Features.tsx)).
- All motion respects `prefers-reduced-motion`.

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
